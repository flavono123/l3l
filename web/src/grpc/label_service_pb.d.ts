import * as jspb from 'google-protobuf'



export class ResourceRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ResourceRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ResourceRequest): ResourceRequest.AsObject;
  static serializeBinaryToWriter(message: ResourceRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ResourceRequest;
  static deserializeBinaryFromReader(message: ResourceRequest, reader: jspb.BinaryReader): ResourceRequest;
}

export namespace ResourceRequest {
  export type AsObject = {
  }
}

export class SearchRequest extends jspb.Message {
  getGroup(): string;
  setGroup(value: string): SearchRequest;

  getVersion(): string;
  setVersion(value: string): SearchRequest;

  getResource(): string;
  setResource(value: string): SearchRequest;

  getNamespace(): string;
  setNamespace(value: string): SearchRequest;

  getKeyword(): string;
  setKeyword(value: string): SearchRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SearchRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SearchRequest): SearchRequest.AsObject;
  static serializeBinaryToWriter(message: SearchRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SearchRequest;
  static deserializeBinaryFromReader(message: SearchRequest, reader: jspb.BinaryReader): SearchRequest;
}

export namespace SearchRequest {
  export type AsObject = {
    group: string,
    version: string,
    resource: string,
    namespace: string,
    keyword: string,
  }
}

export class Highlight extends jspb.Message {
  getIndicesList(): Array<number>;
  setIndicesList(value: Array<number>): Highlight;
  clearIndicesList(): Highlight;
  addIndices(value: number, index?: number): Highlight;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Highlight.AsObject;
  static toObject(includeInstance: boolean, msg: Highlight): Highlight.AsObject;
  static serializeBinaryToWriter(message: Highlight, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Highlight;
  static deserializeBinaryFromReader(message: Highlight, reader: jspb.BinaryReader): Highlight;
}

export namespace Highlight {
  export type AsObject = {
    indicesList: Array<number>,
  }
}

export class MetaLabelResponse extends jspb.Message {
  getName(): string;
  setName(value: string): MetaLabelResponse;

  getNamespace(): string;
  setNamespace(value: string): MetaLabelResponse;

  getLabelsMap(): jspb.Map<string, string>;
  clearLabelsMap(): MetaLabelResponse;

  getKeyHighlightsMap(): jspb.Map<string, Highlight>;
  clearKeyHighlightsMap(): MetaLabelResponse;

  getValueHighlightsMap(): jspb.Map<string, Highlight>;
  clearValueHighlightsMap(): MetaLabelResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MetaLabelResponse.AsObject;
  static toObject(includeInstance: boolean, msg: MetaLabelResponse): MetaLabelResponse.AsObject;
  static serializeBinaryToWriter(message: MetaLabelResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MetaLabelResponse;
  static deserializeBinaryFromReader(message: MetaLabelResponse, reader: jspb.BinaryReader): MetaLabelResponse;
}

export namespace MetaLabelResponse {
  export type AsObject = {
    name: string,
    namespace: string,
    labelsMap: Array<[string, string]>,
    keyHighlightsMap: Array<[string, Highlight.AsObject]>,
    valueHighlightsMap: Array<[string, Highlight.AsObject]>,
  }
}

