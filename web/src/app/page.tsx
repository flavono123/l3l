"use client";

import {
  type MetaLabel,
  searchLabels,
  GVR,
  ClusterInfo,
  getClusterInfo,
} from "@/grpc/client";
import { SearchRequest } from "@/grpc/label_service_pb";
import { useCallback, useEffect, useState } from "react";
import {
  AppLayout,
  Badge,
  ColumnLayout,
  ContentLayout,
  Header,
  Link,
  Select,
  type SelectProps,
  SideNavigation,
  SpaceBetween,
  Table,
  TextFilter,
} from "@cloudscape-design/components";
import { generateBadgeColor } from "../../utils/color";
import Hoverable from "@/components/Hoverable";
import HighlightedText from "@/components/HighlightedText";
import _ from "lodash";
import GvrNavigation from "@/components/GvrNavigation";

export default function App() {
  // state
  const [metaLabels, setMetaLabels] = useState(Array<MetaLabel>());
  const [labelKeys, setLabelKeys] = useState<string[]>([]);
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [keyword, setKeyword] = useState<string>("");
  const [keyHighlight, setKeyHighlight] = useState<{ [key: string]: number[] }>(
    {},
  );
  const [selectedGvr, setSelectedGvr] = useState<GVR>({
    group: "",
    version: "",
    resource: "",
  } as GVR);
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const defaultSelectedNamespace: SelectProps.Option = {
    label: "All namespaces",
    value: "",
  };
  const [selectedNamespace, setSelectedNamespace] =
    useState<SelectProps.Option>(defaultSelectedNamespace);

  const debounceSetLoading = useCallback(
    _.debounce((loading: boolean) => {
      setLoading(loading);
    }, 500),
    [],
  );

  useEffect(() => {
    const fetchNamespaces = async () => {
      try {
        const result: ClusterInfo = await getClusterInfo();
        setNamespaces(result.namespaces);
      } catch (error) {
        console.error(error);
      }
    };
    fetchNamespaces();
  }, []);

  useEffect(() => {
    const fetchLabels = async () => {
      debounceSetLoading(true);
      try {
        const { group, version, resource } = selectedGvr;
        const result: MetaLabel[] = await searchLabels({
          group: group,
          version: version,
          resource: resource,
          namespace: selectedNamespace.value,
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
  }, [keyword, debounceSetLoading, selectedGvr, selectedNamespace]);

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

  const handleGvrOnFollow = (gvr: GVR) => {
    setSelectedGvr(gvr);
  };

  const headerText = ({ group, version, resource }: GVR): string => {
    if (group === "" && version === "" && resource === "") {
      return "Select a resource";
    }

    if (group === "") {
      return `${resource}(${version})`;
    } else {
      return `${resource}(${[group, version].join("/")})`;
    }
  };

  return (
    <div>
      <AppLayout
        navigationOpen={true}
        navigation={<GvrNavigation handleGvrOnFollow={handleGvrOnFollow} />}
        contentType="table"
        content={
          <>
            <Table
              header={
                <Header
                  counter={`${metaLabels.length}`}
                  description="Label values"
                  actions={
                    <Select
                      selectedOption={selectedNamespace}
                      onChange={({
                        detail,
                      }: {
                        detail: SelectProps.ChangeDetail;
                      }) => {
                        setSelectedNamespace(detail.selectedOption);
                      }}
                      options={[defaultSelectedNamespace].concat(
                        namespaces.map((namespace) => ({
                          label: namespace,
                          value: namespace,
                        })),
                      )}
                    />
                  }
                >
                  {headerText(selectedGvr)}
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
                    <ColumnLayout columns={100} borders="horizontal">
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
        toolsOpen={true}
        // TODO: find proper items iterable component than side nav
        tools={
          <ContentLayout
            breadcrumbs="WORKINPROCESS"
            header={
              <SpaceBetween size="m">
                <Header
                  variant="h3"
                  info={<Link variant="info">Info</Link>}
                  description="All key matched by keyword to keys or values"
                >
                  Label Keys
                </Header>
              </SpaceBetween>
            }
          >
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
          </ContentLayout>
        }
      ></AppLayout>
    </div>
  );
}
