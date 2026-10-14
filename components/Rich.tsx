import { Fragment } from "react";

// Renders dictionary headings: "\n" breaks the line, *word* is the serif
// accent italic, ~word~ is the outlined display style.
export default function Rich({
  text,
  emClassName = "serif accent italic",
}: {
  text: string;
  emClassName?: string;
}) {
  return text.split("\n").map((line, lineIndex) => (
    <Fragment key={lineIndex}>
      {lineIndex > 0 && <br />}
      {line.split(/(\*[^*]+\*|~[^~]+~)/).map((part, i) => {
        if (part.startsWith("*") && part.endsWith("*") && part.length > 1) {
          return (
            <em key={i} className={emClassName}>
              {part.slice(1, -1)}
            </em>
          );
        }
        if (part.startsWith("~") && part.endsWith("~") && part.length > 1) {
          return (
            <span key={i} className="text-outline">
              {part.slice(1, -1)}
            </span>
          );
        }
        return part;
      })}
    </Fragment>
  ));
}
