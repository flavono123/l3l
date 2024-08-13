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

type GVRetriever struct {
	kubernetesClientset kubernetes.Interface
	discoveryClient     discovery.DiscoveryInterface
}

func NewGVRetriever(config *rest.Config) *GVRetriever {
	kubernetesClientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		panic(err)
	}
	apiextensionClientset, err := apiextensionclientset.NewForConfig(config)
	if err != nil {
		panic(err)
	}

	discoveryClient := discovery.NewDiscoveryClient(apiextensionClientset.RESTClient())

	return &GVRetriever{
		kubernetesClientset: kubernetesClientset,
		discoveryClient:     discoveryClient,
	}
}

func (g *GVRetriever) GetNamespaces() ([]string, error) {
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

func (g *GVRetriever) GetGVRs() ([]schema.GroupVersionResource, error) {
	apiResourceLists, err := g.discoveryClient.ServerPreferredResources()
	if err != nil {
		log.Fatalf("Error getting server resources: %v", err)
		return nil, err
	}

	var gvrList []schema.GroupVersionResource
	for _, apiResourceList := range apiResourceLists {
		groupVersion, err := schema.ParseGroupVersion(apiResourceList.GroupVersion)
		if err != nil {
			return nil, err
		}

		for _, apiResource := range apiResourceList.APIResources {
			gvrList = append(gvrList, groupVersion.WithResource(apiResource.Name))
		}
	}

	g.sortGVRs(gvrList)

	return gvrList, nil
}

func (g *GVRetriever) sortGVRs(gvrList []schema.GroupVersionResource) {
	sort.Slice(gvrList, func(i, j int) bool {
		return gvrList[i].String() < gvrList[j].String()
	})
}
