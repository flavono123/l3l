import "./HighlightedText.scss";

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
          <Fragment key={`fragment-${i}`}>
            <span key={`text-${i}-${start}`}>{text.slice(start, end)}</span>
            <span key={`highlight-${i}-${end}`} className="filter-match">
              {text[end]}
            </span>
          </Fragment>
        );
      })}
      {text.slice(lastIndex)}
    </>
  );
}
