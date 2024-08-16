import * as jspb from 'google-protobuf'



export class ClusterInfoRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ClusterInfoRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ClusterInfoRequest): ClusterInfoRequest.AsObject;
  static serializeBinaryToWriter(message: ClusterInfoRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ClusterInfoRequest;
  static deserializeBinaryFromReader(message: ClusterInfoRequest, reader: jspb.BinaryReader): ClusterInfoRequest;
}

export namespace ClusterInfoRequest {
  export type AsObject = {
  }
}

export class ClusterInfoResponse extends jspb.Message {
  getCurrentContext(): string;
  setCurrentContext(value: string): ClusterInfoResponse;

  getNamespacesList(): Array<string>;
  setNamespacesList(value: Array<string>): ClusterInfoResponse;
  clearNamespacesList(): ClusterInfoResponse;
  addNamespaces(value: string, index?: number): ClusterInfoResponse;

  getGvrsList(): Array<GroupVersionResource>;
  setGvrsList(value: Array<GroupVersionResource>): ClusterInfoResponse;
  clearGvrsList(): ClusterInfoResponse;
  addGvrs(value?: GroupVersionResource, index?: number): GroupVersionResource;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ClusterInfoResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ClusterInfoResponse): ClusterInfoResponse.AsObject;
  static serializeBinaryToWriter(message: ClusterInfoResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ClusterInfoResponse;
  static deserializeBinaryFromReader(message: ClusterInfoResponse, reader: jspb.BinaryReader): ClusterInfoResponse;
}

export namespace ClusterInfoResponse {
  export type AsObject = {
    currentContext: string,
    namespacesList: Array<string>,
    gvrsList: Array<GroupVersionResource.AsObject>,
  }
}

export class GroupVersionResource extends jspb.Message {
  getGroup(): string;
  setGroup(value: string): GroupVersionResource;

  getVersion(): string;
  setVersion(value: string): GroupVersionResource;

  getResource(): string;
  setResource(value: string): GroupVersionResource;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GroupVersionResource.AsObject;
  static toObject(includeInstance: boolean, msg: GroupVersionResource): GroupVersionResource.AsObject;
  static serializeBinaryToWriter(message: GroupVersionResource, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GroupVersionResource;
  static deserializeBinaryFromReader(message: GroupVersionResource, reader: jspb.BinaryReader): GroupVersionResource;
}

export namespace GroupVersionResource {
  export type AsObject = {
    group: string,
    version: string,
    resource: string,
  }
}

