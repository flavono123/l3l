import { type GVR, type ClusterInfo, getClusterInfo } from "@/grpc/client";
import { SideNavigation } from "@cloudscape-design/components";
import { useEffect, useState } from "react";
import _ from "lodash";

interface GvrNavigationProps {
  handleGvrOnFollow: (gvr: GVR) => void;
}

export default function GvrNavigation({
  handleGvrOnFollow,
}: GvrNavigationProps) {
  const [clusterInfo, setClusterInfo] = useState<ClusterInfo>({
    currentContext: "",
    gvrs: [] as unknown as GVR,
    namespaces: [],
  } as unknown as ClusterInfo);
  const [resourcesByGroupVersion, setResourcesByGroupVersion] = useState<{
    [key: string]: GVR[];
  }>({});

  useEffect(() => {
    const fetchClusterInfo = async () => {
      try {
        const result: ClusterInfo = await getClusterInfo();
        setClusterInfo(result);
        setResourcesByGroupVersion(
          _.groupBy(result.gvrs, (gvr: GVR) =>
            gvr.group === ""
              ? `core/${gvr.version}`
              : `${gvr.group}/${gvr.version}`,
          ),
        );
        console.log(resourcesByGroupVersion);
      } catch (error) {
        console.error(error);
      }
    };

    fetchClusterInfo();
    // group gvrs by group-version
  }, []);

  return (
    <SideNavigation
      header={{ text: "Resources", href: "#" }}
      items={Object.keys(resourcesByGroupVersion).map((groupVersion) => ({
        type: "expandable-link-group",
        text: groupVersion,
        href: `#${groupVersion}`,
        items: resourcesByGroupVersion[groupVersion].map((gvr) => ({
          type: "link",
          text: gvr.resource,
          href: `#${gvr.group}/${gvr.version}/${gvr.resource}`,
        })),
      }))}
      onFollow={({ detail }) => {
        if (detail.type !== "link") {
          return;
        }
        const [group, version, resource] = detail.href.slice(1).split("/");
        console.log(`select: ${group}, ${version}, ${resource}`);
        handleGvrOnFollow({ group, version, resource });
      }}
    />
  );
}
