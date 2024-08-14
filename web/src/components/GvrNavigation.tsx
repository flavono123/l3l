import { ClusterInfo, getClusterInfo } from "@/grpc/client";
import { SideNavigation } from "@cloudscape-design/components";
import { useEffect, useState } from "react";

interface GvrNavigationProps {
  // Props
}

export default function GvrNavigation() {
  const [clusterInfo, setClusterInfo] = useState<ClusterInfo>({
    gvrs: [],
  } as ClusterInfo);

  useEffect(() => {
    const fetrchClusterInfo = async () => {
      try {
        const clusterInfo: ClusterInfo = await getClusterInfo();
        setClusterInfo(clusterInfo);
      } catch (error) {
        console.error(error);
      }
    };

    fetrchClusterInfo();
  }, []);

  return (
    <SideNavigation
      header={{ text: "Resources", href: "#" }}
      items={clusterInfo.gvrs.map((gvr) => ({
        key: `${gvr.group}/${gvr.version}/${gvr.resource}`,
        type: "link",
        text: `${gvr.group}/${gvr.version}/${gvr.resource}`,
        href: "#",
      }))}
    />
  );
}
