"use client";

import "./top-navigation.scss";

import {
  type ClusterInfo,
  type GVRInfo,
  type MetaLabel,
  searchLabels,
  getClusterInfo,
} from "@/grpc/client";
import { SearchRequest } from "@/grpc/label_service_pb";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Autosuggest,
  type AutosuggestProps,
  AppLayout,
  type AppLayoutProps,
  Badge,
  BreadcrumbGroup,
  type BreadcrumbGroupProps,
  ColumnLayout,
  ContentLayout,
  Header,
  Select,
  type SelectProps,
  SpaceBetween,
  Table,
  Toggle,
  TopNavigation,
  HelpPanel,
  Icon,
} from "@cloudscape-design/components";
import { generateBadgeColor } from "../../utils/color";
import Hoverable from "@/components/Hoverable";
import HighlightedText from "@/components/HighlightedText";
import _ from "lodash";
import GvrNavigation from "@/components/GvrNavigation";
import { applyMode, Mode } from "@cloudscape-design/global-styles";
import { FaMoon } from "react-icons/fa";

export default function App() {
  // state
  const [metaLabels, setMetaLabels] = useState(Array<MetaLabel>());
  const [labelKeys, setLabelKeys] = useState<string[]>([]);
  const [labelValues, setLabelValues] = useState<string[]>([]);
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [keyword, setKeyword] = useState<string>("");
  const [keyHighlight, setKeyHighlight] = useState<{ [key: string]: number[] }>(
    {},
  );
  const [selectedGvrInfo, setSelectedGvrInfo] = useState<GVRInfo>({
    group: "",
    version: "",
    resource: "",
    namespaced: false,
  } as GVRInfo);
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const defaultSelectedNamespace: SelectProps.Option = {
    label: "All namespaces",
    value: "",
  };
  const [selectedNamespaceOption, setSelectedNamespaceOption] =
    useState<SelectProps.Option>(defaultSelectedNamespace);
  const [navItems, setNavItems] = useState<BreadcrumbGroupProps.Item[]>([]);
  const [navOpen, setNavOpen] = useState<boolean>(true);
  const [toolsOpen, setToolsOpen] = useState<boolean>(true); // TODO: revert to true after focusing on search input
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    return savedDarkMode ? JSON.parse(savedDarkMode) : true; // default true
  });

  // ref
  const appLayout = useRef<AppLayoutProps.Ref>(null);

  const debounceSetLoading = useCallback(
    _.debounce((loading: boolean) => {
      setLoading(loading);
    }, 500),
    [],
  );

  const applyCurrentMode = useCallback((currentDarkMode: boolean) => {
    if (currentDarkMode) {
      applyMode(Mode.Dark);
    } else {
      applyMode(Mode.Light);
    }
  }, []);

  const keywordSuggestions = useCallback((): AutosuggestProps.Options => {
    const result = [
      {
        iconName: "keyboard",
        label: `Enter to filter ${keyword}`,
        value: keyword,
      },
    ];
    if (labelKeys.length > 0) {
      result.push({
        label: "key",
        options: labelKeys.map((key) => ({
          iconName: "key",
          value: key,
          filteringTags: [...key.split("/"), ...key.split(".")],
        })),
      });
    }

    if (labelValues.length > 0) {
      result.push({
        label: "value",
        options: Array.from(new Set(labelValues)).map((value) => ({
          iconName: "suggestions",
          value: value,
        })),
      });
    }

    return result as AutosuggestProps.Options;
  }, [keyword, labelKeys, labelValues]);

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
    applyCurrentMode(darkMode);
  }, []);

  useEffect(() => {
    const fetchLabels = async () => {
      debounceSetLoading(true);
      try {
        const { group, version, resource, namespaced } = selectedGvrInfo;
        const currentNamespace = namespaced
          ? (selectedNamespaceOption.value as string)
          : (defaultSelectedNamespace.value as string);
        const result: MetaLabel[] = await searchLabels({
          group: group,
          version: version,
          resource: resource,
          namespace: currentNamespace,
          keyword: keyword,
        } as SearchRequest.AsObject);
        setMetaLabels(result);
        setLabelKeys(Object.keys(result[0]?.labels || {})); // HACK: these two are fetch from response's metadata should be added, not the first item
        // set unique label values
        setLabelValues(result.flatMap((item) => Object.values(item.labels)));
        const currentKeyHighlights = result[0]?.keyHighlights || [];
        setKeyHighlight(currentKeyHighlights || []); // all metaLabels have the same keyHighlights
        // if (appLayout.current && Object.keys(currentKeyHighlights).length > 0) {
        //  appLayout.current.openTools();
        //  TODO: focust to search input again
        // }
      } catch (error) {
        console.error(error);
      }
      debounceSetLoading(false);
    };

    fetchLabels();

    return () => {
      debounceSetLoading.cancel();
    };
  }, [keyword, debounceSetLoading, selectedNamespaceOption, selectedGvrInfo]);

  const handleMouseEnter = (key: string) => {
    setHoverKey(key);
  };

  const handleMouseLeave = () => {
    setHoverKey(null);
  };

  const handleGvrInfoOnFollow = (gvrInfo: GVRInfo) => {
    setSelectedGvrInfo(gvrInfo);
    const group = gvrInfo.group === "" ? "core" : gvrInfo.group;
    setNavItems([
      { text: "Resources", href: "#" },
      { text: group, href: `#${group}` },
      { text: gvrInfo.version, href: `#${group}/${gvrInfo.version}` },
      {
        text: gvrInfo.resource,
        href: `#${group}/${gvrInfo.version}/${gvrInfo.resource}`,
      },
    ] as BreadcrumbGroupProps.Item[]);
  };

  const headerText = ({ group, version, resource }: GVRInfo): string => {
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
      <div id="h" className="top-navigation">
        <TopNavigation
          identity={{
            href: "#",
            title: "l3l",
            logo: {
              src: "/logo-small-top-navigation.svg",
              alt: "Service",
            },
          }}
          // HACK: https://github.com/cloudscape-design/components/discussions/1740#discussioncomment-7603732
          search={
            <SpaceBetween alignItems="end" size="l">
              <Toggle
                checked={darkMode}
                onChange={() => {
                  const invertedDarkMode = !darkMode;
                  applyCurrentMode(invertedDarkMode);
                  setDarkMode(invertedDarkMode);
                  localStorage.setItem(
                    "darkMode",
                    JSON.stringify(invertedDarkMode),
                  );
                }}
              >
                <FaMoon />
              </Toggle>
            </SpaceBetween>
          }
        />
      </div>
      <AppLayout
        ref={appLayout}
        breadcrumbs={<BreadcrumbGroup items={navItems} />}
        onNavigationChange={({
          detail,
        }: {
          detail: AppLayoutProps.ChangeDetail;
        }) => setNavOpen(detail.open)}
        navigationOpen={navOpen}
        navigation={
          <GvrNavigation handleGvrInfoOnFollow={handleGvrInfoOnFollow} />
        }
        contentType="table"
        content={
          <Table
            header={
              <Header
                counter={`${metaLabels.length}`}
                description="Label values"
                actions={
                  selectedGvrInfo.namespaced ? (
                    <Select
                      selectedOption={selectedNamespaceOption}
                      onChange={({
                        detail,
                      }: {
                        detail: SelectProps.ChangeDetail;
                      }) => {
                        setSelectedNamespaceOption(detail.selectedOption);
                      }}
                      options={[defaultSelectedNamespace].concat(
                        namespaces.map((namespace) => ({
                          label: namespace,
                          value: namespace,
                        })),
                      )}
                      filteringType="auto"
                    />
                  ) : null
                }
              >
                {headerText(selectedGvrInfo)}
              </Header>
            }
            filter={
              // XXX: this change makes distraction to "type" keyword i think
              <Autosuggest
                value={keyword}
                filteringType="auto"
                placeholder="Keyword"
                onChange={({ detail }) => setKeyword(detail.value)}
                options={keywordSuggestions()}
              />
            }
            columnDisplay={[
              { id: "name", visible: true },
              { id: "namespace", visible: selectedGvrInfo.namespaced },
              { id: "labels", visible: true },
            ]}
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
                  <ColumnLayout columns={0} borders="horizontal">
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
        }
        onToolsChange={({ detail }: { detail: AppLayoutProps.ChangeDetail }) =>
          setToolsOpen(detail.open)
        }
        toolsOpen={toolsOpen}
        tools={
          <HelpPanel
            header={
              <Header variant="h3" counter={`${labelKeys.length}`}>
                Keys
              </Header>
            }
            footer={
              keyword ? (
                <p>
                  Some keys are not highlighted since they are filtered by their
                  values.
                </p>
              ) : null
            }
          >
            <SpaceBetween direction="vertical" size="s">
              {labelKeys.map((key: string) => (
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
              ))}
            </SpaceBetween>
          </HelpPanel>
        }
      ></AppLayout>
    </div>
  );
}
