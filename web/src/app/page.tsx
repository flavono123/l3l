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
import Hoverable from "@/components/Hoverable";

export default function App() {
  const [metaLabels, setMetaLabels] = useState(Array<MetaLabel>());
  const [labelKeys, setLabelKeys] = useState<string[]>([]);
  const [hoverKey, setHoverKey] = useState<string | null>(null);
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

  const handleMouseEnter = (key: string) => {
    setHoverKey(key);
    // HACK: maybe required with transitions
    // setLabelKeys((prevKeys) => {
    //   const newKeys = prevKeys.filter((k) => k !== key);
    //   return [key, ...newKeys];
    // });
  };

  const handleMouseLeave = () => {
    setHoverKey(null);
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
              info: (
                <div
                  style={{
                    opacity: hoverKey === key || hoverKey === null ? 1 : 0.2,
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={() => handleMouseEnter(key)}
                  onMouseLeave={() => handleMouseLeave()}
                >
                  <Badge color={generateBadgeColor(key)}>{key}</Badge>
                </div>
              ),
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
                        <div
                          style={{
                            opacity:
                              hoverKey === key || hoverKey === null ? 1 : 0.2,
                            transition: "opacity 0.2s",
                          }}
                          onMouseEnter={() => handleMouseEnter(key)}
                          onMouseLeave={() => handleMouseLeave()}
                        >
                          <Badge color={generateBadgeColor(key)}>{value}</Badge>
                        </div>
                      ))}
                    </ColumnLayout>
                  ),
                },
              ]}
              items={metaLabels}
              loading={loading}
              empty={<div>No labels found</div>}
              wrapLines={true}
            />
          </>
        }
      ></AppLayout>
    </div>
  );
}
