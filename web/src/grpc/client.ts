import { ClusterInfoServiceClient } from "./Cluster_info_serviceServiceClientPb";
import { LabelServiceClient } from "./Label_serviceServiceClientPb";
import {
  ClusterInfoRequest,
  ClusterInfoResponse,
  GroupVersionResource,
} from "./cluster_info_service_pb";
import {
  MetaLabelResponse,
  HighlightResponse,
  SearchRequest,
} from "./label_service_pb";

const labelClient = new LabelServiceClient(
  "http://localhost:50051",
  null,
  null,
);
const clusterInfoClient = new ClusterInfoServiceClient(
  "http://localhost:50051",
  null,
  null,
);

export type MetaLabel = {
  name: string;
  namespace: string;
  labels: { [key: string]: string };
  keyHighlights: { [key: string]: number[] };
  valueHighlights: { [key: string]: number[] };
};

export async function searchLabels({
  group,
  version,
  resource,
  namespace,
  keyword,
}: SearchRequest.AsObject): Promise<MetaLabel[]> {
  return new Promise((resolve, reject) => {
    const request = new SearchRequest();
    request.setGroup(group);
    request.setVersion(version);
    request.setResource(resource);
    request.setNamespace(namespace);
    request.setKeyword(keyword);

    const stream = labelClient.searchLabels(request, {});
    const metaLabels: MetaLabel[] = [];

    stream.on("data", (response: MetaLabelResponse) => {
      const {
        name,
        namespace,
        labelsMap,
        keyHighlightsMap,
        valueHighlightsMap,
      }: MetaLabelResponse.AsObject = response.toObject();

      metaLabels.push({
        name,
        namespace,
        labels: Object.fromEntries(labelsMap),
        keyHighlights: Object.fromEntries(
          Object.entries(keyHighlightsMap).map(
            ([_, value]: [string, [string, HighlightResponse.AsObject]]) => [
              value[0], // key of label
              value[1].indicesList, // indices of keyword in key
            ],
          ),
        ),
        valueHighlights: Object.fromEntries(
          Object.entries(valueHighlightsMap).map(
            ([_, value]: [string, [string, HighlightResponse.AsObject]]) => [
              value[0], // key of label
              value[1].indicesList, // indices of keyword in value
            ],
          ),
        ),
      });
    });

    stream.on("end", () => {
      console.log("searchLabels response:", metaLabels);
      resolve(metaLabels);
    });

    stream.on("error", (err) => {
      reject(err);
    });
  });
}

export type GVR = {
  group: string;
  version: string;
  resource: string;
};

export type ClusterInfo = {
  currentContext: string;
  namespaces: string[];
  gvrs: GVR[];
};

export async function getClusterInfo(): Promise<ClusterInfo> {
  return new Promise((resolve, reject) => {
    const request = new ClusterInfoRequest();

    clusterInfoClient.getClusterInfo(
      request,
      {},
      (err, response: ClusterInfoResponse) => {
        if (err) {
          reject(err);
          return;
        }

        const { currentContext, namespacesList, gvrsList } =
          response.toObject();

        const gvrs = gvrsList.map((gvr: GroupVersionResource.AsObject) => ({
          group: gvr.group,
          version: gvr.version,
          resource: gvr.resource,
        }));

        resolve({
          currentContext,
          namespaces: namespacesList,
          gvrs,
        });
      },
    );
  });
}
