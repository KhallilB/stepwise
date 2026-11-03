import { Text } from "@kb.ui/react";
import type { GridFrame } from "~/walkthrough/frame";

/** Grid with seen cells and labeled cursors. Each cell's accessible name carries all three. */
export function GridView({ grid }: { grid: GridFrame }) {
  const width = grid.cells[0]?.length ?? 0;
  const inside = ({ row, col }: { row: number; col: number }) =>
    row >= 0 && row < grid.cells.length && col >= 0 && col < width;
  const outside = grid.cursors.filter((cursor) => !inside(cursor));

  return (
    <>
      <table aria-label={grid.name} className="grid-view">
        <thead>
          <tr>
            <td />
            {grid.cells[0]?.map((_, col) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: columns are positions, not identities
              <th key={col} scope="col" className="grid-index">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grid.cells.map((row, r) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: rows are positions, not identities
            <tr key={r}>
              <th scope="row" className="grid-index">
                {r}
              </th>
              {row.map((value, c) => {
                const seen = grid.visited[r]?.[c] ?? false;
                const names = grid.cursors
                  .filter((p) => p.row === r && p.col === c)
                  .map((p) => p.name);
                const label = [`row ${r}`, `column ${c}`, `value ${String(value)}`];
                if (seen) label.push("seen");
                return (
                  <td
                    // biome-ignore lint/suspicious/noArrayIndexKey: cells are positions, not identities
                    key={c}
                    aria-label={[...label, ...names].join(", ")}
                    className="grid-cell"
                    data-visited={seen || undefined}
                    data-pointed={names.length > 0 || undefined}
                  >
                    <span className="grid-value" aria-hidden="true">
                      {String(value)}
                      {seen && <span className="grid-seen">✓</span>}
                    </span>
                    <span className="grid-cursors" aria-hidden="true">
                      {names.map((name) => (
                        <span key={name}>{name}</span>
                      ))}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {outside.map(({ name, row, col }) => (
        <Text key={name} size="sm" className="grid-outside">
          {name} is ({row}, {col}), outside the grid
        </Text>
      ))}
    </>
  );
}
