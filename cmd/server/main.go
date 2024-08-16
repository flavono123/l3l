package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sort"

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
	pb.ClusterInfoServiceServer
	searchers map[string]*k8s.Searcher
	retriever *k8s.Retriever
}

func NewServer() *server {
	config, err := clientcmd.BuildConfigFromFlags("", filepath.Join(os.Getenv("HOME"), ".kube", "config"))
	if err != nil {
		panic(err)
	}

	return &server{
		searchers: make(map[string]*k8s.Searcher),
		retriever: k8s.NewRetriever(config),
	}
}

func (s *server) SearchLabels(req *pb.SearchRequest, stream pb.LabelService_SearchLabelsServer) error {
	log.Printf("Received SearchLabels request: %+v\n", req)
	searcher := s.getSearcher(req)

	channel := make(chan k8s.PartialObjectMeta)
	go func() {
		defer close(channel)

		log.Printf("Starting search for keyword: %s\n", req.Keyword)
		if err := searcher.Search(req.Keyword, channel); err != nil {
			panic(err)
		}
	}()

	// sort channel by name
	var results []k8s.PartialObjectMeta
	for ch := range channel {
		results = append(results, ch)
	}
	sort.Slice(results, func(i, j int) bool {
		return results[i].Name < results[j].Name
	})

	for _, result := range results {
		response := &pb.MetaLabelResponse{
			Name:            result.Name,
			Namespace:       result.Namespace,
			Labels:          result.Labels,
			KeyHighlights:   convertToPbHighlightMap(result.KeyHighlights),
			ValueHighlights: convertToPbHighlightMap(result.ValueHighlights),
		}
		log.Printf("Sending response: %+v\n", response)
		if err := stream.Send(response); err != nil {
			panic(err)
		}
	}
	return nil
}

func (s *server) GetClusterInfo(ctx context.Context, req *pb.ClusterInfoRequest) (*pb.ClusterInfoResponse, error) {
	namespaces, err := s.retriever.GetNamespaces()
	if err != nil {
		return nil, err
	}

	return &pb.ClusterInfoResponse{
		CurrentContext: "todo",
		Namespaces:     namespaces,
	}, nil
}

func (s *server) ListGroupVersionResources(req *pb.GroupVersionResourceRequest, stream pb.ClusterInfoService_ListGroupVersionResourcesServer) error {
	gvrs, err := s.retriever.GetGVRs()
	if err != nil {
		return err
	}

	for _, gvr := range gvrs {
		response := &pb.GroupVersionResourceResponse{
			Group:    gvr.Group,
			Version:  gvr.Version,
			Resource: gvr.Resource,
		}
		if err := stream.Send(response); err != nil {
			return err
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

func convertToPbHighlightMap(highlights map[string]k8s.Highlight) map[string]*pb.HighlightResponse {
	result := make(map[string]*pb.HighlightResponse)
	for k, v := range highlights {
		result[k] = &pb.HighlightResponse{Indices: v.Indices}
	}
	return result
}

func main() {
	grpcServer := grpc.NewServer()
	srv := NewServer()
	pb.RegisterLabelServiceServer(grpcServer, srv)
	pb.RegisterClusterInfoServiceServer(grpcServer, srv)

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
