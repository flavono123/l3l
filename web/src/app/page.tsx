"use client"

import { searchLabels } from "@/grpc/client";
import { useState } from "react";
import {
  Button,
  ColumnLayout,
  Header,
  Table,
} from "@cloudscape-design/components"

export default function App() {
  const [labels, setLabels] = useState([] as any[]);
  const [loading, setLoading] = useState(true);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const result = await searchLabels('', 'v1', 'nodes', '', 'node');
      setLabels(result as any[]);
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
          { id: 'name', header: 'Name', cell: (e: any) => e.name },
          { id: 'namespace', header: 'Namespace', cell: (e: any) => e.namespace },
          {
            id: 'labels',
            header: 'Labels',
            cell: (e: any) => (
              <ColumnLayout columns={1} variant="text-grid">
                {Object.entries(e.labels).map(([key, value]) => (
                  <div key={key}>
                    <strong>{key}</strong>: {value}
                  </div>
                ))}
              </ColumnLayout>
            ),
          },
        ]}
        items={labels}
        loading={loading}
        empty={<div>No labels found</div>}
      />
    </div>
  );
}
