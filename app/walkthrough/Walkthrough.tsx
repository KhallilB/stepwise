import { Badge, Panel, Toolbar } from "@kbui/react";
import { useCallback, useEffect, useState } from "react";
import type { Problem } from "~/problems/problem";
import { ArrayView } from "~/views/ArrayView";
import { clampStep, frameAt } from "./frame";

// Toolbar keeps arrows for its own focus moves; editable fields keep them for typing.
const ownsArrows = 'input, textarea, select, [contenteditable="true"], [role="toolbar"]';

type Move = (index: number, total: number) => number;

const first: Move = () => 0;
const previous: Move = (i) => i - 1;
const next: Move = (i) => i + 1;
const last: Move = (_, total) => total - 1;

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
    <div className="walk">
      <div className="walk-panes">
        <Panel aria-labelledby="walk-code-title">
          <Panel.Header>
            <h2 id="walk-code-title">Code</h2>
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
            <h2 id="walk-view-title">Picture</h2>
            <Badge>{problem.viewSpec.badge}</Badge>
          </Panel.Header>
          <Panel.Body>
            {frame.arrays.map((array) => (
              <ArrayView key={array.name} array={array} />
            ))}
          </Panel.Body>
        </Panel>
      </div>

      <div className="walk-bar">
        <p role="status" className="walk-sentence">
          {frame.sentence}
        </p>
        <div className="walk-controls">
          <Toolbar aria-label="Step controls">
            <Toolbar.Button aria-label="First step" disabled={atStart} onClick={() => go(first)}>
              ⏮
            </Toolbar.Button>
            <Toolbar.Button
              aria-label="Previous step"
              disabled={atStart}
              onClick={() => go(previous)}
            >
              ◀
            </Toolbar.Button>
            <Toolbar.Button aria-label="Next step" disabled={atEnd} onClick={() => go(next)}>
              ▶
            </Toolbar.Button>
            <Toolbar.Button aria-label="Last step" disabled={atEnd} onClick={() => go(last)}>
              ⏭
            </Toolbar.Button>
          </Toolbar>
          <span className="walk-position">
            Step {index + 1} of {total}
          </span>
        </div>
      </div>
    </div>
  );
}
