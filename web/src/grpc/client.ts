import { LabelServiceClient } from './Label_serviceServiceClientPb';
import { SearchRequest } from './label_service_pb';

const client = new LabelServiceClient('http://localhost:50051', null, null);

type MetaLabel = {
  name: string;
  namespace: string;
  labels: { [key: string]: string };
}


export const searchLabels = async (group: string, version: string, resource: string, namespace: string, keyword: string) => {
  return new Promise((resolve, reject) => {
    const request = new SearchRequest();
    request.setGroup(group);
    request.setVersion(version);
    request.setResource(resource);
    request.setNamespace(namespace);
    request.setKeyword(keyword);

    const stream = client.searchLabels(request, {});
    const labels: MetaLabel[] = [];

    stream.on('data', (response) => {
      const labelData = response.toObject();
      const labelsMap = labelData.labelsMap || [];
      const labelsObj: { [key: string]: string } = {};
      labelsMap.forEach(([key, value]) => {
        labelsObj[key] = value;
      });

      labels.push({
        name: labelData.name,
        namespace: labelData.namespace,
        labels: labelsObj,
      });
    });

    stream.on('end', () => {
      console.log("searchLabels response:", labels);
      resolve(labels);
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
};

