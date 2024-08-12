package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"

	"github.com/flavono123/l3l/internal/k8s"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/tools/clientcmd"
)

func main() {
	// Kubernetes 클라이언트 설정
	client, err := getClient()
	if err != nil {
		panic(err.Error())
	}

	// 테스트용 GroupVersionResource 설정
	gvr := schema.GroupVersionResource{
		Group:    "",
		Version:  "v1",
		Resource: "nodes",
	}

	// Searcher 초기화
	searcher := k8s.NewSearcher(client, gvr, "")

	// 검색할 키워드 설정
	keyword := "tst" // 예시로 "app" 키워드를 사용

	// 검색 결과를 받을 스트림 채널 생성
	stream := make(chan k8s.PartialObjectMeta)

	// 컨텍스트와 종료 시그널 설정
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// 종료 시그널 핸들러
	sigterm := make(chan os.Signal, 1)
	signal.Notify(sigterm, syscall.SIGTERM, syscall.SIGINT)

	go func() {
		<-sigterm
		cancel()
	}()

	// 리소스 감시 시작
	searcher.Watch()

	// 검색 실행
	go func() {
		defer close(stream)

		err := searcher.Search(keyword, stream)
		if err != nil {
			fmt.Printf("Error searching resources: %v\n", err)
			return
		}
	}()

	// 스트림에서 결과를 받아 출력
	for {
		select {
		case meta, ok := <-stream:
			if !ok {
				return // 스트림이 닫히면 종료
			}
			fmt.Printf("Found: %s/%s with labels: %v\n", meta.Namespace, meta.Name, meta.Labels, meta.KeyHighlights, meta.ValueHighlights)
		case <-ctx.Done():
			return
		}
	}
}

func getClient() (dynamic.Interface, error) {
	config, err := clientcmd.BuildConfigFromFlags("", filepath.Join(os.Getenv("HOME"), ".kube", "config"))
	if err != nil {
		return nil, err
	}
	return dynamic.NewForConfig(config)
}
