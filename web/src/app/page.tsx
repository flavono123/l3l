"use client";

import { type MetaLabel, searchLabels } from "@/grpc/client";
import { SearchRequest } from "@/grpc/label_service_pb";
import { useCallback, useEffect, useState } from "react";
import {
  AppLayout,
  Badge,
  ColumnLayout,
  Header,
  SideNavigation,
  SpaceBetween,
  Table,
  TextFilter,
} from "@cloudscape-design/components";
import { generateBadgeColor } from "../../utils/color";
import Hoverable from "@/components/Hoverable";
import HighlightedText from "@/components/HighlightedText";
import _ from "lodash";

export default function App() {
  const [metaLabels, setMetaLabels] = useState(Array<MetaLabel>());
  const [labelKeys, setLabelKeys] = useState<string[]>([]);
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [keyword, setKeyword] = useState<string>("");
  const [keyHighlight, setKeyHighlight] = useState<{ [key: string]: number[] }>(
    {},
  );

  const debounceSetLoading = useCallback(
    _.debounce((loading: boolean) => {
      setLoading(loading);
    }, 500),
    [],
  );

  useEffect(() => {
    const fetchLabels = async () => {
      debounceSetLoading(true);
      try {
        const result: MetaLabel[] = await searchLabels({
          group: "",
          version: "v1",
          resource: "nodes",
          namespace: "",
          keyword: keyword,
        } as SearchRequest.AsObject);
        setMetaLabels(result);
        setLabelKeys(Object.keys(result[0]?.labels || {})); // HACK: these two are fetch from response's metadata should be added, not the first item
        setKeyHighlight(result[0]?.keyHighlights || []); // all metaLabels have the same keyHighlights
      } catch (error) {
        console.error(error);
      }
      debounceSetLoading(false);
    };

    fetchLabels();

    return () => {
      debounceSetLoading.cancel();
    };
  }, [keyword, debounceSetLoading]);

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
          // TODO: current items should be in a column layout
          <SideNavigation
            header={{ text: "Labels keys", href: "#" }}
            items={labelKeys.map((key) => ({
              key: key,
              type: "link",
              text: "",
              href: "#",
              info: (
                <Hoverable
                  key={key}
                  keyName={key}
                  hoverKey={hoverKey}
                  handleMouseEnter={handleMouseEnter}
                  handleMouseLeave={handleMouseLeave}
                >
                  <Badge color={generateBadgeColor(key)}>
                    <HighlightedText
                      text={key}
                      indices={keyHighlight[key] || []}
                    />
                  </Badge>
                </Hoverable>
              ),
            }))}
          />
        }
        contentType="table"
        content={
          <>
            <Table
              header={
                <Header
                  counter={`${metaLabels.length}`}
                  description="Label values"
                >
                  Resources
                </Header>
              }
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
                      <SpaceBetween direction="horizontal" size="xxs">
                        {Object.entries(item.labels).map(([key, value]) => (
                          <Hoverable
                            key={`${item.namespace}/${item.name}-${key}`}
                            keyName={key}
                            hoverKey={hoverKey}
                            handleMouseEnter={handleMouseEnter}
                            handleMouseLeave={handleMouseLeave}
                          >
                            <Badge color={generateBadgeColor(key)}>
                              <HighlightedText
                                text={value}
                                indices={item.valueHighlights[key] || []}
                              />
                            </Badge>
                          </Hoverable>
                        ))}
                      </SpaceBetween>
                    </ColumnLayout>
                  ),
                },
              ]}
              contentDensity="compact"
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
