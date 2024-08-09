package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/flavono123/l3l/internal/k8s"
	"github.com/improbable-eng/grpc-web/go/grpcweb"
	"github.com/rs/cors"
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
	grpcServer := grpc.NewServer()
	pb.RegisterLabelServiceServer(grpcServer, NewServer())

	// Reflection API 활성화
	reflection.Register(grpcServer)

	wrappedGrpc := grpcweb.WrapServer(grpcServer)
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"}, // 필요한 클라이언트 도메인 추가
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		ExposedHeaders:   []string{"Grpc-Status", "Grpc-Message", "Grpc-Encoding", "Grpc-Accept-Encoding"},
		AllowCredentials: true,
		Debug:            true,
	})

	handler := c.Handler(http.HandlerFunc(func(resp http.ResponseWriter, req *http.Request) {
		if wrappedGrpc.IsGrpcWebRequest(req) || wrappedGrpc.IsGrpcWebSocketRequest(req) || wrappedGrpc.IsAcceptableGrpcCorsRequest(req) {
			wrappedGrpc.ServeHTTP(resp, req)
		} else {
			http.DefaultServeMux.ServeHTTP(resp, req)
		}
	}))

	port := ":50051"
	log.Printf("gRPC server listening on port %s", port)
	if err := http.ListenAndServe(port, handler); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
