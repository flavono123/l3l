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

	gvretriever := k8s.NewGVRetriever(config)
	gvrs, err := gvretriever.GetGVRs()
	if err != nil {
		panic(nil)
	}

	for _, gvr := range gvrs {
		fmt.Printf("%s\n", gvr.String())
	}
}
