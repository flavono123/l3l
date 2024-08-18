package k8s

import (
	"context"
	"log"
	"sort"

	apiextensionclientset "k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/discovery"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

type Retriever struct {
	kubernetesClientset kubernetes.Interface
	discoveryClient     discovery.DiscoveryInterface
}

type GVRInfo struct {
	GVR        schema.GroupVersionResource
	Namespaced bool
}

func NewRetriever(config *rest.Config) *Retriever {
	kubernetesClientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		panic(err)
	}
	apiextensionClientset, err := apiextensionclientset.NewForConfig(config)
	if err != nil {
		panic(err)
	}

	discoveryClient := discovery.NewDiscoveryClient(apiextensionClientset.RESTClient())

	return &Retriever{
		kubernetesClientset: kubernetesClientset,
		discoveryClient:     discoveryClient,
	}
}

func (g *Retriever) GetNamespaces() ([]string, error) {
	namespaceList, err := g.kubernetesClientset.CoreV1().Namespaces().List(context.Background(), metav1.ListOptions{})
	if err != nil {
		log.Fatalf("Error getting namespaces: %v", err)
		return nil, err
	}

	var namespaces []string
	for _, namespace := range namespaceList.Items {
		namespaces = append(namespaces, namespace.Name)
	}

	sort.Strings(namespaces)

	return namespaces, nil
}

func (g *Retriever) GetGVRInfos() ([]GVRInfo, error) {
	apiResourceLists, err := g.discoveryClient.ServerPreferredResources()
	if err != nil {
		log.Fatalf("Error getting server resources: %v", err)
		return nil, err
	}

	var gvrInfos []GVRInfo
	for _, apiResourceList := range apiResourceLists {
		groupVersion, err := schema.ParseGroupVersion(apiResourceList.GroupVersion)
		if err != nil {
			return nil, err
		}

		for _, apiResource := range apiResourceList.APIResources {
			gvrInfos = append(gvrInfos, GVRInfo{
				GVR:        groupVersion.WithResource(apiResource.Name),
				Namespaced: apiResource.Namespaced,
			})
		}
	}

	g.sortGVRs(gvrInfos)

	return gvrInfos, nil
}

func (g *Retriever) sortGVRs(gvrInfos []GVRInfo) {
	sort.Slice(gvrInfos, func(i, j int) bool {
		return gvrInfos[i].GVR.String() < gvrInfos[j].GVR.String()
	})
}
