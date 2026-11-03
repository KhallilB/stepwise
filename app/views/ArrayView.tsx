import { Text } from "@kb.ui/react";
import type { ArrayFrame } from "~/walkthrough/frame";

/** Array with labeled pointers. Each cell's accessible name carries index, value and pointers. */
export function ArrayView({ array }: { array: ArrayFrame }) {
  if (!array.defined || array.items.length === 0) {
    return (
      <Text size="sm" tone="muted" className="array-empty">
        {array.defined ? "empty" : "not created yet"}
      </Text>
    );
  }
  return (
    <ol aria-label={array.name} className="array-view">
      {array.items.map((value, index) => {
        const names = array.pointers.filter((p) => p.index === index).map((p) => p.name);
        return (
          <li
            // biome-ignore lint/suspicious/noArrayIndexKey: cells are positions, not identities
            key={index}
            aria-label={[`index ${index}`, `value ${String(value)}`, ...names].join(", ")}
            className="array-cell"
            data-pointed={names.length > 0 || undefined}
          >
            <span className="array-index" aria-hidden="true">
              {index}
            </span>
            <span className="array-value" aria-hidden="true">
              {String(value)}
            </span>
            <span className="array-pointers" aria-hidden="true">
              {names.map((name) => (
                <span key={name} className="array-pointer">
                  {name}
                </span>
              ))}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
