import { type GVRInfo, listGroupVersionResources } from "@/grpc/client";
import {
  SideNavigation,
  type SideNavigationProps,
} from "@cloudscape-design/components";
import { useEffect, useState } from "react";
import _ from "lodash";

interface GvrNavigationProps {
  handleGvrInfoOnFollow: (gvrInfo: GVRInfo) => void;
}

export default function GvrNavigation({
  handleGvrInfoOnFollow,
}: GvrNavigationProps) {
  const [resourcesByGroupVersion, setResourcesByGroupVersion] = useState<{
    [key: string]: GVRInfo[];
  }>({});

  useEffect(() => {
    const fetchGVRs = async () => {
      try {
        const result: GVRInfo[] = await listGroupVersionResources();
        setResourcesByGroupVersion(
          _.groupBy(result, (gvr: GVRInfo) =>
            gvr.group === ""
              ? `core/${gvr.version}`
              : `${gvr.group}/${gvr.version}`,
          ),
        );
      } catch (error) {
        console.error(error);
      }
    };

    fetchGVRs();
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
          href: `#${gvr.group}/${gvr.version}/${gvr.resource}${gvr.namespaced ? "@" : ""}` as string,
        })),
      }))}
      onFollow={({ detail }: { detail: SideNavigationProps.FollowDetail }) => {
        if (detail.type !== "link") {
          return;
        }
        // HACK: parsing href is a hack itself
        // e.g. "#/v1/nodes" or "#/apps/v1/deployments@"
        const namespaced = detail.href.includes("@");
        const groupVersionResource = namespaced
          ? detail.href.slice(1, -1)
          : detail.href.slice(1);
        const [group, version, resource] = groupVersionResource.split("/");
        console.log({ group, version, resource, namespaced });
        handleGvrInfoOnFollow({ group, version, resource, namespaced });
      }}
    />
  );
}
