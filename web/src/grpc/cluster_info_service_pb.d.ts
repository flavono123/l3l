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

export class GroupVersionResourceRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GroupVersionResourceRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GroupVersionResourceRequest): GroupVersionResourceRequest.AsObject;
  static serializeBinaryToWriter(message: GroupVersionResourceRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GroupVersionResourceRequest;
  static deserializeBinaryFromReader(message: GroupVersionResourceRequest, reader: jspb.BinaryReader): GroupVersionResourceRequest;
}

export namespace GroupVersionResourceRequest {
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
  }
}

export class GroupVersionResourceResponse extends jspb.Message {
  getGroup(): string;
  setGroup(value: string): GroupVersionResourceResponse;

  getVersion(): string;
  setVersion(value: string): GroupVersionResourceResponse;

  getResource(): string;
  setResource(value: string): GroupVersionResourceResponse;

  getNamespaced(): boolean;
  setNamespaced(value: boolean): GroupVersionResourceResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GroupVersionResourceResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GroupVersionResourceResponse): GroupVersionResourceResponse.AsObject;
  static serializeBinaryToWriter(message: GroupVersionResourceResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GroupVersionResourceResponse;
  static deserializeBinaryFromReader(message: GroupVersionResourceResponse, reader: jspb.BinaryReader): GroupVersionResourceResponse;
}

export namespace GroupVersionResourceResponse {
  export type AsObject = {
    group: string,
    version: string,
    resource: string,
    namespaced: boolean,
  }
}

