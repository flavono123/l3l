package k8s

import (
	"testing"

	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	fakediscovery "k8s.io/client-go/discovery/fake"
	fakeclientset "k8s.io/client-go/kubernetes/fake"
	fakecorev1 "k8s.io/client-go/kubernetes/typed/core/v1/fake"
	kubetesting "k8s.io/client-go/testing"
)

func TestGVRetriever(t *testing.T) {
	fakeClientSet := fakeclientset.NewSimpleClientset()
	fakeDiscovery := fakeClientSet.Discovery().(*fakediscovery.FakeDiscovery)
	fakeDiscovery.Resources = []*metav1.APIResourceList{
		{
			GroupVersion: "v1",
			APIResources: []metav1.APIResource{
				{Name: "pods", Namespaced: true, Kind: "Pod"},
				{Name: "services", Namespaced: true, Kind: "Service"},
			},
		},
		{
			GroupVersion: "apps/v1",
			APIResources: []metav1.APIResource{
				{Name: "deployments", Namespaced: true, Kind: "Deployment"},
			},
		},
	}
	// TODO: mock with prepend reactor?

	//	fakeDiscovery.PrependReactor("get", "api-resource", func(action kubetesting.Action) (handled bool, ret runtime.Object, err error) {
	//		mockResourceList := []*metav1.APIResourceList{
	//			{
	//				GroupVersion: "v1",
	//				APIResources: []metav1.APIResource{
	//					{Name: "pods", Namespaced: true, Kind: "Pod"},
	//					{Name: "services", Namespaced: true, Kind: "Service"},
	//				},
	//			},
	//			{
	//				GroupVersion: "apps/v1",
	//				APIResources: []metav1.APIResource{
	//					{Name: "deployments", Namespaced: true, Kind: "Deployment"},
	//				},
	//			},
	//		}
	//		return true, mockResourceList, nil
	//	})
	//
	//	fakeClientSet.PrependReactor("list", "namespaces", func(action kubetesting.Action) (handled bool, ret runtime.Object, err error) {
	//		return true, unstructured.Unstructured{
	//			Items: []unstructured.Unstructured{
	//				{ObjectMeta: metav1.ObjectMeta{Name: "default"}},
	//				{ObjectMeta: metav1.ObjectMeta{Name: "kube-system"}},
	//				{ObjectMeta: metav1.ObjectMeta{Name: "kube-public"}},
	//			}, nil,
	//		}
	//	})
	//

	fakeClientSet.CoreV1().(*fakecorev1.FakeCoreV1).PrependReactor("list", "namespaces", func(action kubetesting.Action) (handled bool, ret runtime.Object, err error) {
		mockResult := &v1.NamespaceList{
			Items: []v1.Namespace{
				{ObjectMeta: metav1.ObjectMeta{Name: "default"}},
				{ObjectMeta: metav1.ObjectMeta{Name: "kube-system"}},
				{ObjectMeta: metav1.ObjectMeta{Name: "kube-public"}},
			},
		}
		return true, mockResult, nil
	})

	retriever := &GVRetriever{
		kubernetesClientset: fakeClientSet,
		discoveryClient:     fakeDiscovery,
	}

	t.Run("GetGVRs", func(t *testing.T) {
		gvrList, err := retriever.GetGVRs()
		if err != nil {
			t.Fatalf("Error getting GVRs: %v", err)
		}

		expectedGVRs := []schema.GroupVersionResource{
			{Group: "", Version: "v1", Resource: "pods"},
			{Group: "", Version: "v1", Resource: "services"},
			{Group: "apps", Version: "v1", Resource: "deployments"},
		}

		retriever.sortGVRs(expectedGVRs)

		if len(gvrList) != len(expectedGVRs) {
			t.Fatalf("Expected %d GVRs, got %d", len(expectedGVRs), len(gvrList))
		}

		for i, gvr := range gvrList {
			if gvr != expectedGVRs[i] {
				t.Errorf("Expected GVR %v, got %v", expectedGVRs[i], gvr)
			}
		}
	})

	t.Run("GetNamespaces", func(t *testing.T) {
		namespaces, err := retriever.GetNamespaces()
		if err != nil {
			t.Fatalf("Error getting namespaces: %v", err)
		}
		expectedNamespaces := []string{"default", "kube-public", "kube-system"}

		if len(namespaces) != len(expectedNamespaces) {
			t.Fatalf("Expected %d namespaces, got %d", len(expectedNamespaces), len(namespaces))
		}
		for i, ns := range namespaces {
			if ns != expectedNamespaces[i] {
				t.Errorf("Expected namespace %s, got %s", expectedNamespaces[i], ns)
			}
		}
	})
}
