import { Fragment } from "react";

interface HighlightedTextProps {
  text: string;
  indices: number[];
}

export default function HighlightedText({
  text,
  indices,
}: HighlightedTextProps) {
  if (indices.length === 0) {
    return <>{text}</>;
  }
  let lastIndex = 0;
  return (
    <>
      {indices.map((index, i) => {
        const start = lastIndex;
        const end = index;
        lastIndex = index + 1;
        return (
          <>
            {text.slice(start, end)}
            <span
              key={i}
              style={{
                backgroundColor: "yellow",
                fontWeight: "bold",
                color: "black",
              }}
            >
              {text[end]}
            </span>
          </>
        );
      })}
      {text.slice(lastIndex)}
    </>
  );
}
