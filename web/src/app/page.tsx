"use client"

import { type MetaLabel, searchLabels } from "@/grpc/client";
import { SearchRequest } from "@/grpc/label_service_pb";
import { useState } from "react";
import {
  Button,
  ColumnLayout,
  Header,
  Table,
} from "@cloudscape-design/components"

export default function App() {
  const [metaLabels, setMetaLabels] = useState(Array<MetaLabel>());
  const [loading, setLoading] = useState(true);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const result: MetaLabel[] = await searchLabels({
        group: '',
        version: 'v1',
        resource: 'nodes',
        namespace: '',
        keyword: 'node'
      } as SearchRequest.AsObject);
      setMetaLabels(result);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div>
      <Button onClick={handleSearch}>Search</Button>
      <Table
        header={<Header>Labels</Header>}
        columnDefinitions={[
          { id: 'name', header: 'Name', cell: (item: MetaLabel) => item.name },
          { id: 'namespace', header: 'Namespace', cell: (item: MetaLabel) => item.namespace },
          {
            id: 'labels',
            header: 'Labels',
            cell: (item: MetaLabel) => (
              <ColumnLayout columns={1} variant="text-grid">
                {Object.entries(item.labels).map(([key, value]) => (
                  <div key={key}>
                    <strong>{key}</strong>: {value}
                  </div>
                ))}
              </ColumnLayout>
            ),
          },
        ]}
        items={metaLabels}
        loading={loading}
        empty={<div>No labels found</div>}
      />
    </div>
  );
}
