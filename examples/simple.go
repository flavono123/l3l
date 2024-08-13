package main

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/flavono123/l3l/internal/k8s"
	"k8s.io/client-go/tools/clientcmd"
)

func main() {
	config, err := clientcmd.BuildConfigFromFlags("", filepath.Join(os.Getenv("HOME"), ".kube", "config"))
	if err != nil {
		panic(err)
	}

	retriever := k8s.NewRetriever(config)
	gvrs, err := retriever.GetGVRs()
	if err != nil {
		panic(err)
	}

	fmt.Println("GroupVersionResource:")
	for _, gvr := range gvrs {
		fmt.Printf("- %s\n", gvr.String())
	}

	fmt.Println("Namespaces:")
	namespaces, err := retriever.GetNamespaces()
	if err != nil {
		panic(err)
	}
	for _, ns := range namespaces {
		fmt.Printf("- %s\n", ns)
	}
}
