package k8s

import (
	"context"
	"fmt"
	"sync"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/watch"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/tools/cache"

	"github.com/sahilm/fuzzy"
)

type Highlight struct {
	Indices []int32
}

type PartialObjectMeta struct {
	Labels          map[string]string
	KeyHighlights   map[string]Highlight
	ValueHighlights map[string]Highlight
	Name            string
	Namespace       string
}

type Searcher struct { // TODO: optimize paddings
	client dynamic.Interface
	gvr    schema.GroupVersionResource
	// cache
	resourceCache  map[string]PartialObjectMeta // Name, Namespace, Labels만 쓰인다
	cacheMutex     sync.Mutex
	cacheHasSynced bool
	cacheSyncCond  *sync.Cond
	// watch context
	ctx    context.Context
	cancel context.CancelFunc
}

// constructor
func NewSearcher(client dynamic.Interface, gvr schema.GroupVersionResource) *Searcher {
	ctx, cancel := context.WithCancel(context.Background())
	searcher := &Searcher{
		client:        client,
		gvr:           gvr,
		resourceCache: make(map[string]PartialObjectMeta),
		ctx:           ctx,
		cancel:        cancel,
	}
	searcher.cacheSyncCond = sync.NewCond(&searcher.cacheMutex)
	return searcher
}

// methods
// public
func (s *Searcher) Search(namespace, keyword string, stream chan<- PartialObjectMeta) error {
	s.cacheMutex.Lock()
	defer s.cacheMutex.Unlock()

	s.waitUntilCacheSynced()

	for _, meta := range s.resourceCache {
		if isMatched(keyword, &meta) && (namespace == "" || namespace == meta.Namespace) {
			stream <- meta
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
	// watch resources in all namespace and filter in search
	lw := &cache.ListWatch{
		ListFunc: func(options metav1.ListOptions) (runtime.Object, error) {
			return s.client.Resource(s.gvr).Namespace("").List(context.Background(), options)
		},
		WatchFunc: func(options metav1.ListOptions) (watch.Interface, error) {
			return s.client.Resource(s.gvr).Namespace("").Watch(context.Background(), options)
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
	s.notifyCacheSynced()

	<-ctx.Done()
	close(stop)
	return ctx.Err()
}

func (s *Searcher) waitUntilCacheSynced() {
	for !s.cacheHasSynced {
		s.cacheSyncCond.Wait()
	}
}

func (s *Searcher) notifyCacheSynced() {
	// HACK: cacheMutex is for resourceCache is it proper for this?
	s.cacheMutex.Lock()
	s.cacheHasSynced = true
	s.cacheSyncCond.Broadcast()
	s.cacheMutex.Unlock()
}

// helpers
func convertToPbIndices(match fuzzy.Match) []int32 {
	var indices []int32
	for _, index := range match.MatchedIndexes {
		indices = append(indices, int32(index))
	}
	return indices
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

// TODO: extract side effect, update Highlights
func isMatched(keyword string, pom *PartialObjectMeta) bool {
	if keyword == "" {
		return true
	}

	updateHighlights(keyword, pom)

	if len(pom.KeyHighlights) > 0 || len(pom.ValueHighlights) > 0 {
		return true
	}

	return false
}

func updateHighlights(keyword string, pom *PartialObjectMeta) {
	keyHighlights := make(map[string]Highlight)
	valueHighlights := make(map[string]Highlight)
	for k, v := range pom.Labels {
		kMatches := fuzzy.Find(keyword, []string{k})
		vMatches := fuzzy.Find(keyword, []string{v})
		if len(kMatches) > 0 {
			keyHighlights[k] = Highlight{
				Indices: convertToPbIndices(kMatches[0]),
			}
		}
		if len(vMatches) > 0 {
			valueHighlights[k] = Highlight{
				Indices: convertToPbIndices(vMatches[0]),
			}
		}
	}
	pom.KeyHighlights = keyHighlights
	pom.ValueHighlights = valueHighlights
}
