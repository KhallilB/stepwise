import {
  Badge,
  Code,
  Grid,
  Heading,
  Inline,
  Panel,
  Split,
  Text,
  Toolbar,
  Tooltip,
} from "@kb.ui/react";
import { useCallback, useEffect, useState } from "react";
import type { Problem } from "~/problems/problem";
import { ArrayView } from "~/views/ArrayView";
import { GridView } from "~/views/GridView";
import { clampStep, frameAt } from "./frame";

// Toolbar keeps arrows for its own focus moves; editable fields keep them for typing.
const ownsArrows = 'input, textarea, select, [contenteditable="true"], [role="toolbar"]';

type Move = (index: number, total: number) => number;

const first: Move = () => 0;
const previous: Move = (i) => i - 1;
const next: Move = (i) => i + 1;
const last: Move = (_, total) => total - 1;

// Tooltips name the key that does the same move.
const buttons: { label: string; icon: string; key: string; move: Move; edge: "start" | "end" }[] = [
  { label: "First step", icon: "⏮", key: "Home", move: first, edge: "start" },
  { label: "Previous step", icon: "◀", key: "←", move: previous, edge: "start" },
  { label: "Next step", icon: "▶", key: "→", move: next, edge: "end" },
  { label: "Last step", icon: "⏭", key: "End", move: last, edge: "end" },
];

const keyMoves: Record<string, Move> = {
  arrowleft: previous,
  arrowright: next,
  home: first,
  end: last,
};

export function Walkthrough({ problem }: { problem: Problem }) {
  const total = problem.trace.steps.length;
  const lines = problem.trace.source.split("\n");
  const [index, setIndex] = useState(0);
  const frame = frameAt(problem, index);

  const go = useCallback(
    (move: Move) => setIndex((i) => clampStep(move(i, total), total)),
    [total],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.target instanceof Element && event.target.closest(ownsArrows)) return;
      const move = keyMoves[event.key.toLowerCase()];
      if (!move) return;
      event.preventDefault();
      go(move);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const atStart = index === 0;
  const atEnd = index === total - 1;

  return (
    <Grid layout="stack">
      <Split collapse="md">
        <Panel aria-labelledby="walk-code-title">
          <Panel.Header>
            <Heading level={2} size="sm" id="walk-code-title">
              Code
            </Heading>
          </Panel.Header>
          <Panel.Body>
            <ol aria-label="Code" className="code">
              {lines.map((text, n) => {
                const line = n + 1;
                return (
                  <li
                    key={line}
                    data-line={line}
                    aria-current={line === frame.line ? "step" : undefined}
                  >
                    <span className="code-number" aria-hidden="true">
                      {line}
                    </span>
                    <code>{text}</code>
                  </li>
                );
              })}
            </ol>
          </Panel.Body>
        </Panel>

        <Panel aria-labelledby="walk-view-title">
          <Panel.Header>
            <Heading level={2} size="sm" id="walk-view-title">
              Picture
            </Heading>
            <Badge>{problem.viewSpec.badge}</Badge>
          </Panel.Header>
          <Panel.Body>
            <Inline gap="lg" align="start">
              {frame.views.map((view) => (
                <figure key={view.name} className="view">
                  <figcaption>
                    <Code>{view.name}</Code>
                  </figcaption>
                  {view.kind === "grid" ? <GridView grid={view} /> : <ArrayView array={view} />}
                </figure>
              ))}
            </Inline>
          </Panel.Body>
        </Panel>
      </Split>

      <Grid layout="stack" className="walk-bar">
        {/* kbui stopgap: G6 screen-reader announcer. */}
        <Text role="status" size="lg" className="walk-sentence">
          {frame.sentence}
        </Text>
        <Inline gap="md" align="center">
          <Toolbar aria-label="Step controls">
            {buttons.map(({ label, icon, key, move, edge }) => (
              <Tooltip key={label} content={`${label} (${key})`}>
                <Toolbar.Button
                  aria-label={label}
                  disabled={edge === "start" ? atStart : atEnd}
                  onClick={() => go(move)}
                >
                  {icon}
                </Toolbar.Button>
              </Tooltip>
            ))}
          </Toolbar>
          <Text as="span" tone="muted" className="walk-position">
            Step {index + 1} of {total}
          </Text>
        </Inline>
      </Grid>
    </Grid>
  );
}
