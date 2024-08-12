import { ReactNode } from "react";
import "./Hoverable.css";

interface HoverableProps {
  keyName: string;
  hoverKey: string | null;
  handleMouseEnter: (key: string) => void;
  handleMouseLeave: () => void;
  children: ReactNode;
}

export default function Hoverable({
  keyName,
  hoverKey,
  handleMouseEnter,
  handleMouseLeave,
  children,
}: HoverableProps) {
  const isFocused = hoverKey === keyName || hoverKey === null;

  return (
    <>
      <div
        onMouseEnter={() => handleMouseEnter(keyName)}
        onMouseLeave={() => handleMouseLeave()}
        data-hover={isFocused ? "true" : "false"}
      >
        {children}
      </div>
    </>
  );
}
