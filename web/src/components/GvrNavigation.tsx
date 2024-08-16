import { type GVR, listGroupVersionResources } from "@/grpc/client";
import { SideNavigation } from "@cloudscape-design/components";
import { useEffect, useState } from "react";
import _ from "lodash";

interface GvrNavigationProps {
  handleGvrOnFollow: (gvr: GVR) => void;
}

export default function GvrNavigation({
  handleGvrOnFollow,
}: GvrNavigationProps) {
  const [resourcesByGroupVersion, setResourcesByGroupVersion] = useState<{
    [key: string]: GVR[];
  }>({});

  useEffect(() => {
    const fetchGVRs = async () => {
      try {
        const result: GVR[] = await listGroupVersionResources();
        setResourcesByGroupVersion(
          _.groupBy(result, (gvr: GVR) =>
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
          href: `#${gvr.group}/${gvr.version}/${gvr.resource}`,
        })),
      }))}
      onFollow={({ detail }) => {
        // HACK: parsing href is a hack itself
        if (detail.type !== "link") {
          return;
        }
        const [group, version, resource] = detail.href.slice(1).split("/");
        handleGvrOnFollow({ group, version, resource });
      }}
    />
  );
}
