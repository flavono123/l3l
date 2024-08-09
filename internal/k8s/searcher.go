package k8s

import (
	"context"
	"fmt"
	"strings"
	"sync"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/watch"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/tools/cache"
)

type PartialObjectMeta struct {
	Name      string
	Namespace string
	Labels    map[string]string
}

type Searcher struct {
	client    dynamic.Interface
	gvr       schema.GroupVersionResource
	namespace string
	// cache
	resourceCache map[string]PartialObjectMeta // Name, Namespace, Labels만 쓰인다
	cacheMutex    sync.Mutex
	hasSynced     bool
	syncCond      *sync.Cond
	// watch context
	ctx    context.Context
	cancel context.CancelFunc
}

// constructor
func NewSearcher(client dynamic.Interface, gvr schema.GroupVersionResource, namespace string) *Searcher {
	ctx, cancel := context.WithCancel(context.Background())
	searcher := &Searcher{
		client:        client,
		gvr:           gvr,
		namespace:     namespace,
		resourceCache: make(map[string]PartialObjectMeta),
		ctx:           ctx,
		cancel:        cancel,
	}
	searcher.syncCond = sync.NewCond(&searcher.cacheMutex)
	return searcher
}

// methods
// public
func (s *Searcher) Search(keyword string, stream chan<- PartialObjectMeta) error {
	s.cacheMutex.Lock()
	defer s.cacheMutex.Unlock()

	// Wait until cache is synced
	for !s.hasSynced {
		s.syncCond.Wait()
	}

	// filter by label key or value match with keyword from cache
	for _, meta := range s.resourceCache {
		for k, v := range meta.Labels {
			if match(k, keyword) || match(v, keyword) {
				stream <- meta
				break
			}
		}
	}

	return nil
}

func (s *Searcher) Watch() {
	go func() {
		if err := s.watchResources(s.ctx); err != nil {
			panic(err)
		}
	}()
}

func (s *Searcher) Stop() {
	s.cancel()
}

// private
func (s *Searcher) watchResources(ctx context.Context) error {
	lw := &cache.ListWatch{
		ListFunc: func(options metav1.ListOptions) (runtime.Object, error) {
			return s.client.Resource(s.gvr).Namespace(s.namespace).List(context.Background(), options)
		},
		WatchFunc: func(options metav1.ListOptions) (watch.Interface, error) {
			return s.client.Resource(s.gvr).Namespace(s.namespace).Watch(context.Background(), options)
		},
	}

	_, controller := cache.NewInformer(
		lw,
		&unstructured.Unstructured{},
		0,
		cache.ResourceEventHandlerFuncs{
			AddFunc: func(obj interface{}) {
				s.cacheMutex.Lock()
				defer s.cacheMutex.Unlock()
				resource := obj.(*unstructured.Unstructured)
				key := cacheKey(resource)
				s.resourceCache[key] = toPartialObjectMeta(resource)
			},
			UpdateFunc: func(oldObj, newObj interface{}) {
				s.cacheMutex.Lock()
				defer s.cacheMutex.Unlock()
				resource := newObj.(*unstructured.Unstructured)
				key := cacheKey(resource)
				s.resourceCache[key] = toPartialObjectMeta(resource)
			},
			DeleteFunc: func(obj interface{}) {
				s.cacheMutex.Lock()
				defer s.cacheMutex.Unlock()
				resource := obj.(*unstructured.Unstructured)
				key := cacheKey(resource)
				delete(s.resourceCache, key)
			},
		},
	)

	stop := make(chan struct{})
	go controller.Run(stop)

	// Wait for cache sync
	if !cache.WaitForCacheSync(stop, controller.HasSynced) {
		close(stop)
		return fmt.Errorf("failed to sync cache")
	}

	// Notify that cache has synced
	s.cacheMutex.Lock()
	s.hasSynced = true
	s.syncCond.Broadcast()
	s.cacheMutex.Unlock()

	<-ctx.Done()
	close(stop)
	return ctx.Err()
}

// helpers
func match(target string, keyword string) bool {
	// TODO: fuzzy matching
	return strings.Contains(target, keyword)
}

func cacheKey(resource *unstructured.Unstructured) string {
	return fmt.Sprintf("%s:%s:%s",
		resource.GroupVersionKind(),
		resource.GetNamespace(),
		resource.GetName(),
	)
}

func toPartialObjectMeta(resource *unstructured.Unstructured) PartialObjectMeta {
	return PartialObjectMeta{
		Name:      resource.GetName(),
		Namespace: resource.GetNamespace(),
		Labels:    resource.GetLabels(),
	}
}
