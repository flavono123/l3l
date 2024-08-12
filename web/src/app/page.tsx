"use client";

import { type MetaLabel, searchLabels } from "@/grpc/client";
import { SearchRequest } from "@/grpc/label_service_pb";
import { useState } from "react";
import {
  AppLayout,
  Badge,
  Button,
  ColumnLayout,
  Header,
  SideNavigation,
  Table,
} from "@cloudscape-design/components";
import { generateBadgeColor } from "../../utils/color";

export default function App() {
  const [metaLabels, setMetaLabels] = useState(Array<MetaLabel>());
  const [labelKeys, setLabelKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const result: MetaLabel[] = await searchLabels({
        group: "",
        version: "v1",
        resource: "nodes",
        namespace: "",
        keyword: "node",
      } as SearchRequest.AsObject);
      setMetaLabels(result);

      setLabelKeys(result.map((item) => Object.keys(item.labels)).flat());
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div>
      <AppLayout
        navigationOpen={true}
        navigation={
          <SideNavigation
            header={{ text: "Labels keys", href: "#" }}
            items={labelKeys.map((key) => ({
              type: "link",
              text: "",
              href: "#",
              info: <Badge color={generateBadgeColor(key)}>{key}</Badge>,
            }))}
          />
        }
        contentType="table"
        content={
          <>
            <Button onClick={handleSearch}>Search</Button>
            <Table
              header={<Header>Labels</Header>}
              columnDefinitions={[
                {
                  id: "name",
                  header: "Name",
                  cell: (item: MetaLabel) => item.name,
                },
                {
                  id: "namespace",
                  header: "Namespace",
                  cell: (item: MetaLabel) => item.namespace,
                },
                {
                  id: "labels",
                  header: "Labels",
                  cell: (item: MetaLabel) => (
                    <ColumnLayout columns={10} borders="horizontal">
                      {Object.entries(item.labels).map(([key, value]) => (
                        <Badge color={generateBadgeColor(key)}>{value}</Badge>
                      ))}
                    </ColumnLayout>
                  ),
                },
              ]}
              items={metaLabels}
              loading={loading}
              empty={<div>No labels found</div>}
            />
          </>
        }
      ></AppLayout>
    </div>
  );
}
