// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.34.2
// 	protoc        v5.27.3
// source: cluster_info_service.proto

package api

import (
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
	reflect "reflect"
	sync "sync"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

type ClusterInfoRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields
}

func (x *ClusterInfoRequest) Reset() {
	*x = ClusterInfoRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_cluster_info_service_proto_msgTypes[0]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *ClusterInfoRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*ClusterInfoRequest) ProtoMessage() {}

func (x *ClusterInfoRequest) ProtoReflect() protoreflect.Message {
	mi := &file_cluster_info_service_proto_msgTypes[0]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use ClusterInfoRequest.ProtoReflect.Descriptor instead.
func (*ClusterInfoRequest) Descriptor() ([]byte, []int) {
	return file_cluster_info_service_proto_rawDescGZIP(), []int{0}
}

type GroupVersionResourceRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields
}

func (x *GroupVersionResourceRequest) Reset() {
	*x = GroupVersionResourceRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_cluster_info_service_proto_msgTypes[1]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *GroupVersionResourceRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GroupVersionResourceRequest) ProtoMessage() {}

func (x *GroupVersionResourceRequest) ProtoReflect() protoreflect.Message {
	mi := &file_cluster_info_service_proto_msgTypes[1]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GroupVersionResourceRequest.ProtoReflect.Descriptor instead.
func (*GroupVersionResourceRequest) Descriptor() ([]byte, []int) {
	return file_cluster_info_service_proto_rawDescGZIP(), []int{1}
}

type ClusterInfoResponse struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	CurrentContext string   `protobuf:"bytes,1,opt,name=current_context,json=currentContext,proto3" json:"current_context,omitempty"`
	Namespaces     []string `protobuf:"bytes,2,rep,name=namespaces,proto3" json:"namespaces,omitempty"`
}

func (x *ClusterInfoResponse) Reset() {
	*x = ClusterInfoResponse{}
	if protoimpl.UnsafeEnabled {
		mi := &file_cluster_info_service_proto_msgTypes[2]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *ClusterInfoResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*ClusterInfoResponse) ProtoMessage() {}

func (x *ClusterInfoResponse) ProtoReflect() protoreflect.Message {
	mi := &file_cluster_info_service_proto_msgTypes[2]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use ClusterInfoResponse.ProtoReflect.Descriptor instead.
func (*ClusterInfoResponse) Descriptor() ([]byte, []int) {
	return file_cluster_info_service_proto_rawDescGZIP(), []int{2}
}

func (x *ClusterInfoResponse) GetCurrentContext() string {
	if x != nil {
		return x.CurrentContext
	}
	return ""
}

func (x *ClusterInfoResponse) GetNamespaces() []string {
	if x != nil {
		return x.Namespaces
	}
	return nil
}

type GroupVersionResourceResponse struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Group      string `protobuf:"bytes,1,opt,name=group,proto3" json:"group,omitempty"`
	Version    string `protobuf:"bytes,2,opt,name=version,proto3" json:"version,omitempty"`
	Resource   string `protobuf:"bytes,3,opt,name=resource,proto3" json:"resource,omitempty"`
	Namespaced bool   `protobuf:"varint,4,opt,name=namespaced,proto3" json:"namespaced,omitempty"`
}

func (x *GroupVersionResourceResponse) Reset() {
	*x = GroupVersionResourceResponse{}
	if protoimpl.UnsafeEnabled {
		mi := &file_cluster_info_service_proto_msgTypes[3]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *GroupVersionResourceResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GroupVersionResourceResponse) ProtoMessage() {}

func (x *GroupVersionResourceResponse) ProtoReflect() protoreflect.Message {
	mi := &file_cluster_info_service_proto_msgTypes[3]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GroupVersionResourceResponse.ProtoReflect.Descriptor instead.
func (*GroupVersionResourceResponse) Descriptor() ([]byte, []int) {
	return file_cluster_info_service_proto_rawDescGZIP(), []int{3}
}

func (x *GroupVersionResourceResponse) GetGroup() string {
	if x != nil {
		return x.Group
	}
	return ""
}

func (x *GroupVersionResourceResponse) GetVersion() string {
	if x != nil {
		return x.Version
	}
	return ""
}

func (x *GroupVersionResourceResponse) GetResource() string {
	if x != nil {
		return x.Resource
	}
	return ""
}

func (x *GroupVersionResourceResponse) GetNamespaced() bool {
	if x != nil {
		return x.Namespaced
	}
	return false
}

var File_cluster_info_service_proto protoreflect.FileDescriptor

var file_cluster_info_service_proto_rawDesc = []byte{
	0x0a, 0x1a, 0x63, 0x6c, 0x75, 0x73, 0x74, 0x65, 0x72, 0x5f, 0x69, 0x6e, 0x66, 0x6f, 0x5f, 0x73,
	0x65, 0x72, 0x76, 0x69, 0x63, 0x65, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x12, 0x03, 0x61, 0x70,
	0x69, 0x22, 0x14, 0x0a, 0x12, 0x43, 0x6c, 0x75, 0x73, 0x74, 0x65, 0x72, 0x49, 0x6e, 0x66, 0x6f,
	0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x22, 0x1d, 0x0a, 0x1b, 0x47, 0x72, 0x6f, 0x75, 0x70,
	0x56, 0x65, 0x72, 0x73, 0x69, 0x6f, 0x6e, 0x52, 0x65, 0x73, 0x6f, 0x75, 0x72, 0x63, 0x65, 0x52,
	0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x22, 0x5e, 0x0a, 0x13, 0x43, 0x6c, 0x75, 0x73, 0x74, 0x65,
	0x72, 0x49, 0x6e, 0x66, 0x6f, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x12, 0x27, 0x0a,
	0x0f, 0x63, 0x75, 0x72, 0x72, 0x65, 0x6e, 0x74, 0x5f, 0x63, 0x6f, 0x6e, 0x74, 0x65, 0x78, 0x74,
	0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x0e, 0x63, 0x75, 0x72, 0x72, 0x65, 0x6e, 0x74, 0x43,
	0x6f, 0x6e, 0x74, 0x65, 0x78, 0x74, 0x12, 0x1e, 0x0a, 0x0a, 0x6e, 0x61, 0x6d, 0x65, 0x73, 0x70,
	0x61, 0x63, 0x65, 0x73, 0x18, 0x02, 0x20, 0x03, 0x28, 0x09, 0x52, 0x0a, 0x6e, 0x61, 0x6d, 0x65,
	0x73, 0x70, 0x61, 0x63, 0x65, 0x73, 0x22, 0x8a, 0x01, 0x0a, 0x1c, 0x47, 0x72, 0x6f, 0x75, 0x70,
	0x56, 0x65, 0x72, 0x73, 0x69, 0x6f, 0x6e, 0x52, 0x65, 0x73, 0x6f, 0x75, 0x72, 0x63, 0x65, 0x52,
	0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x12, 0x14, 0x0a, 0x05, 0x67, 0x72, 0x6f, 0x75, 0x70,
	0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x05, 0x67, 0x72, 0x6f, 0x75, 0x70, 0x12, 0x18, 0x0a,
	0x07, 0x76, 0x65, 0x72, 0x73, 0x69, 0x6f, 0x6e, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52, 0x07,
	0x76, 0x65, 0x72, 0x73, 0x69, 0x6f, 0x6e, 0x12, 0x1a, 0x0a, 0x08, 0x72, 0x65, 0x73, 0x6f, 0x75,
	0x72, 0x63, 0x65, 0x18, 0x03, 0x20, 0x01, 0x28, 0x09, 0x52, 0x08, 0x72, 0x65, 0x73, 0x6f, 0x75,
	0x72, 0x63, 0x65, 0x12, 0x1e, 0x0a, 0x0a, 0x6e, 0x61, 0x6d, 0x65, 0x73, 0x70, 0x61, 0x63, 0x65,
	0x64, 0x18, 0x04, 0x20, 0x01, 0x28, 0x08, 0x52, 0x0a, 0x6e, 0x61, 0x6d, 0x65, 0x73, 0x70, 0x61,
	0x63, 0x65, 0x64, 0x32, 0xbd, 0x01, 0x0a, 0x12, 0x43, 0x6c, 0x75, 0x73, 0x74, 0x65, 0x72, 0x49,
	0x6e, 0x66, 0x6f, 0x53, 0x65, 0x72, 0x76, 0x69, 0x63, 0x65, 0x12, 0x43, 0x0a, 0x0e, 0x47, 0x65,
	0x74, 0x43, 0x6c, 0x75, 0x73, 0x74, 0x65, 0x72, 0x49, 0x6e, 0x66, 0x6f, 0x12, 0x17, 0x2e, 0x61,
	0x70, 0x69, 0x2e, 0x43, 0x6c, 0x75, 0x73, 0x74, 0x65, 0x72, 0x49, 0x6e, 0x66, 0x6f, 0x52, 0x65,
	0x71, 0x75, 0x65, 0x73, 0x74, 0x1a, 0x18, 0x2e, 0x61, 0x70, 0x69, 0x2e, 0x43, 0x6c, 0x75, 0x73,
	0x74, 0x65, 0x72, 0x49, 0x6e, 0x66, 0x6f, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x12,
	0x62, 0x0a, 0x19, 0x4c, 0x69, 0x73, 0x74, 0x47, 0x72, 0x6f, 0x75, 0x70, 0x56, 0x65, 0x72, 0x73,
	0x69, 0x6f, 0x6e, 0x52, 0x65, 0x73, 0x6f, 0x75, 0x72, 0x63, 0x65, 0x73, 0x12, 0x20, 0x2e, 0x61,
	0x70, 0x69, 0x2e, 0x47, 0x72, 0x6f, 0x75, 0x70, 0x56, 0x65, 0x72, 0x73, 0x69, 0x6f, 0x6e, 0x52,
	0x65, 0x73, 0x6f, 0x75, 0x72, 0x63, 0x65, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x1a, 0x21,
	0x2e, 0x61, 0x70, 0x69, 0x2e, 0x47, 0x72, 0x6f, 0x75, 0x70, 0x56, 0x65, 0x72, 0x73, 0x69, 0x6f,
	0x6e, 0x52, 0x65, 0x73, 0x6f, 0x75, 0x72, 0x63, 0x65, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73,
	0x65, 0x30, 0x01, 0x42, 0x26, 0x5a, 0x24, 0x67, 0x69, 0x74, 0x68, 0x75, 0x62, 0x2e, 0x63, 0x6f,
	0x6d, 0x2f, 0x66, 0x6c, 0x61, 0x76, 0x6f, 0x6e, 0x6f, 0x31, 0x32, 0x33, 0x2f, 0x6c, 0x33, 0x6c,
	0x2f, 0x61, 0x70, 0x69, 0x2f, 0x70, 0x62, 0x3b, 0x61, 0x70, 0x69, 0x62, 0x06, 0x70, 0x72, 0x6f,
	0x74, 0x6f, 0x33,
}

var (
	file_cluster_info_service_proto_rawDescOnce sync.Once
	file_cluster_info_service_proto_rawDescData = file_cluster_info_service_proto_rawDesc
)

func file_cluster_info_service_proto_rawDescGZIP() []byte {
	file_cluster_info_service_proto_rawDescOnce.Do(func() {
		file_cluster_info_service_proto_rawDescData = protoimpl.X.CompressGZIP(file_cluster_info_service_proto_rawDescData)
	})
	return file_cluster_info_service_proto_rawDescData
}

var file_cluster_info_service_proto_msgTypes = make([]protoimpl.MessageInfo, 4)
var file_cluster_info_service_proto_goTypes = []any{
	(*ClusterInfoRequest)(nil),           // 0: api.ClusterInfoRequest
	(*GroupVersionResourceRequest)(nil),  // 1: api.GroupVersionResourceRequest
	(*ClusterInfoResponse)(nil),          // 2: api.ClusterInfoResponse
	(*GroupVersionResourceResponse)(nil), // 3: api.GroupVersionResourceResponse
}
var file_cluster_info_service_proto_depIdxs = []int32{
	0, // 0: api.ClusterInfoService.GetClusterInfo:input_type -> api.ClusterInfoRequest
	1, // 1: api.ClusterInfoService.ListGroupVersionResources:input_type -> api.GroupVersionResourceRequest
	2, // 2: api.ClusterInfoService.GetClusterInfo:output_type -> api.ClusterInfoResponse
	3, // 3: api.ClusterInfoService.ListGroupVersionResources:output_type -> api.GroupVersionResourceResponse
	2, // [2:4] is the sub-list for method output_type
	0, // [0:2] is the sub-list for method input_type
	0, // [0:0] is the sub-list for extension type_name
	0, // [0:0] is the sub-list for extension extendee
	0, // [0:0] is the sub-list for field type_name
}

func init() { file_cluster_info_service_proto_init() }
func file_cluster_info_service_proto_init() {
	if File_cluster_info_service_proto != nil {
		return
	}
	if !protoimpl.UnsafeEnabled {
		file_cluster_info_service_proto_msgTypes[0].Exporter = func(v any, i int) any {
			switch v := v.(*ClusterInfoRequest); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_cluster_info_service_proto_msgTypes[1].Exporter = func(v any, i int) any {
			switch v := v.(*GroupVersionResourceRequest); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_cluster_info_service_proto_msgTypes[2].Exporter = func(v any, i int) any {
			switch v := v.(*ClusterInfoResponse); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_cluster_info_service_proto_msgTypes[3].Exporter = func(v any, i int) any {
			switch v := v.(*GroupVersionResourceResponse); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
	}
	type x struct{}
	out := protoimpl.TypeBuilder{
		File: protoimpl.DescBuilder{
			GoPackagePath: reflect.TypeOf(x{}).PkgPath(),
			RawDescriptor: file_cluster_info_service_proto_rawDesc,
			NumEnums:      0,
			NumMessages:   4,
			NumExtensions: 0,
			NumServices:   1,
		},
		GoTypes:           file_cluster_info_service_proto_goTypes,
		DependencyIndexes: file_cluster_info_service_proto_depIdxs,
		MessageInfos:      file_cluster_info_service_proto_msgTypes,
	}.Build()
	File_cluster_info_service_proto = out.File
	file_cluster_info_service_proto_rawDesc = nil
	file_cluster_info_service_proto_goTypes = nil
	file_cluster_info_service_proto_depIdxs = nil
}
