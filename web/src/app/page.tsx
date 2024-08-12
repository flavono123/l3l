"use client";

import { type MetaLabel, searchLabels } from "@/grpc/client";
import { SearchRequest } from "@/grpc/label_service_pb";
import { useEffect, useState } from "react";
import {
  AppLayout,
  Badge,
  Button,
  ColumnLayout,
  Header,
  SideNavigation,
  Table,
  TextFilter,
} from "@cloudscape-design/components";
import { generateBadgeColor } from "../../utils/color";
import Hoverable from "@/components/Hoverable";

export default function App() {
  const [metaLabels, setMetaLabels] = useState(Array<MetaLabel>());
  const [labelKeys, setLabelKeys] = useState<string[]>([]);
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [keyword, setKeyword] = useState<string>("");

  useEffect(() => {
    const fetchLabels = async () => {
      setLoading(true);
      try {
        const result: MetaLabel[] = await searchLabels({
          group: "",
          version: "v1",
          resource: "nodes",
          namespace: "",
          keyword: keyword,
        } as SearchRequest.AsObject);
        setMetaLabels(result);
        setLabelKeys(result.map((item) => Object.keys(item.labels)).flat());
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };

    fetchLabels();
  }, [keyword]);

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
                <Hoverable
                  keyName={key}
                  hoverKey={hoverKey}
                  handleMouseEnter={handleMouseEnter}
                  handleMouseLeave={handleMouseLeave}
                >
                  <Badge color={generateBadgeColor(key)}>{key}</Badge>
                </Hoverable>
              ),
            }))}
          />
        }
        contentType="table"
        content={
          <>
            <Table
              header={<Header>Labels</Header>}
              filter={
                <TextFilter
                  filteringText={keyword}
                  filteringPlaceholder="Find by labels' key/value"
                  onChange={({ detail }) => setKeyword(detail.filteringText)}
                />
              }
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
                        <Hoverable
                          keyName={key}
                          hoverKey={hoverKey}
                          handleMouseEnter={handleMouseEnter}
                          handleMouseLeave={handleMouseLeave}
                        >
                          <Badge color={generateBadgeColor(key)}>{value}</Badge>
                        </Hoverable>
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
