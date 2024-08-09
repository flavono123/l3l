package main

import (
	"fmt"
	"log"
	"net"
	"os"
	"path/filepath"

	"github.com/flavono123/l3l/internal/k8s"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/tools/clientcmd"

	pb "github.com/flavono123/l3l/api/pb"
)

// server는 pb.LabelServiceServer 인터페이스를 구현합니다.

type server struct {
	pb.UnimplementedLabelServiceServer
	searchers map[string]*k8s.Searcher
}

func NewServer() *server {
	return &server{
		searchers: make(map[string]*k8s.Searcher),
	}
}

func (s *server) SearchLabels(req *pb.SearchRequest, stream pb.LabelService_SearchLabelsServer) error {
	log.Printf("Received SearchLabels request: %+v\n", req)
	searcher := s.getSearcher(req)

	results := make(chan k8s.PartialObjectMeta)
	go func() {
		defer close(results)

		log.Printf("Starting search for keyword: %s\n", req.Keyword)
		if err := searcher.Search(req.Keyword, results); err != nil {
			panic(err)
		}
	}()

	for result := range results {
		response := &pb.MetaLabelResponse{
			Name:      result.Name,
			Namespace: result.Namespace,
			Labels:    result.Labels,
		}
		log.Printf("Sending response: %+v\n", response)
		if err := stream.Send(response); err != nil {
			panic(err)
		}
	}
	return nil
}

func (s *server) getSearcher(req *pb.SearchRequest) *k8s.Searcher {
	key := searcherKey(req.Group, req.Version, req.Resource, req.Namespace)
	searcher, ok := s.searchers[key]
	if !ok {
		log.Printf("Creating new searcher for key: %s\n", key)
		client, err := getClient()
		if err != nil {
			panic(err)
		}

		searcher = k8s.NewSearcher(
			client,
			schema.GroupVersionResource{
				Group:    req.Group,
				Version:  req.Version,
				Resource: req.Resource,
			},
			req.Namespace,
		)

		log.Printf("Watching resources for key: %s\n", key)
		searcher.Watch()

		s.searchers[key] = searcher
	}

	return searcher
}

func searcherKey(group, version, resource, namespace string) string {
	return fmt.Sprintf("%s:%s:%s:%s", group, version, resource, namespace)
}

func getClient() (dynamic.Interface, error) {
	config, err := clientcmd.BuildConfigFromFlags("", filepath.Join(os.Getenv("HOME"), ".kube", "config"))
	if err != nil {
		return nil, err
	}
	return dynamic.NewForConfig(config)
}

func main() {
	listener, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	s := grpc.NewServer()
	pb.RegisterLabelServiceServer(s, NewServer())

	// Reflection API 활성화
	reflection.Register(s)

	log.Println("gRPC server listening on port 50051")
	if err := s.Serve(listener); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
