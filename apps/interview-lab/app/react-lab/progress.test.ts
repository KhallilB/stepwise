import { describe, expect, it } from "vitest";
import { emptyNotebook, parseNotebook, recordAttempt } from "./progress";

describe("personal lab notebook", () => {
  it("rejects corrupt and unsupported storage without losing access to lab", () => {
    expect(parseNotebook("broken")).toEqual(emptyNotebook());
    expect(parseNotebook('{"version":7,"entries":{}}')).toEqual(emptyNotebook());
    expect(parseNotebook('{"version":1,"entries":null}')).toEqual(emptyNotebook());
    expect(parseNotebook('{"version":1,"entries":{"snapshot":{"code":3}}}')).toEqual(
      emptyNotebook(),
    );
  });
  it("keeps only recognized challenges and bounded, correctly typed drafts", () => {
    const parsed = parseNotebook(
      JSON.stringify({
        version: 1,
        entries: {
          snapshot: { code: "my code", notes: "explanation", completed: true },
          unknown: { code: "discard", notes: "", completed: true },
          identity: { code: "valid", notes: "", completed: "yes" },
        },
      }),
    );
    expect(parsed.entries.snapshot).toEqual({
      code: "my code",
      notes: "explanation",
      completed: true,
    });
    expect(parsed.entries.unknown).toBeUndefined();
    expect(parsed.entries.identity).toBeUndefined();
  });
  it("requires passing current code; personal reasoning stays optional", () => {
    const state = emptyNotebook();
    expect(recordAttempt(state, "snapshot", "code", "why", false).entries.snapshot?.completed).toBe(
      false,
    );
    expect(recordAttempt(state, "snapshot", "code", "", true).entries.snapshot?.completed).toBe(
      true,
    );
    expect(
      recordAttempt(state, "snapshot", "code", "I explained the snapshot", true).entries.snapshot
        ?.completed,
    ).toBe(true);
    expect(state.entries.snapshot).toBeUndefined();
  });
});

it("restores valid build stages, rejects out-of-range stages, and keeps stage while editing", () => {
  const entry = { code: "draft", notes: "notes", completed: false };
  const notebook = parseNotebook(
    JSON.stringify({
      version: 1,
      entries: {
        "build-board": { ...entry, stage: 1 },
        "build-directory": { ...entry, stage: 99 },
      },
    }),
  );
  expect(notebook.entries["build-board"]?.stage).toBe(1);
  expect(notebook.entries["build-directory"]?.stage).toBeUndefined();
  expect(
    recordAttempt(notebook, "build-board", "new draft", "notes", false).entries["build-board"]
      ?.stage,
  ).toBe(1);
});

it("answer disclosure ends an attempt without awarding completion or replacing its draft", () => {
  const notebook = recordAttempt(emptyNotebook(), "snapshot", "my draft", "my reasoning", false);
  const ended = recordAttempt(
    notebook,
    "snapshot",
    "my draft",
    "my reasoning",
    true,
    undefined,
    true,
  );
  expect(ended.entries.snapshot).toMatchObject({
    answerRevealed: true,
    completed: false,
    code: "my draft",
  });
  const restored = parseNotebook(JSON.stringify(ended));
  expect(
    recordAttempt(restored, "snapshot", "silent edit", "notes", true).entries.snapshot,
  ).toEqual(restored.entries.snapshot);
});

it("resets one or all challenges with generations, preserving unrelated work", async () => {
  const { resetNotebook } = await import("./progress");
  let notebook = recordAttempt(emptyNotebook(), "snapshot", "A", "why", true);
  notebook = recordAttempt(notebook, "identity", "B", "why", true);
  const single = resetNotebook(notebook, "reset-one", "snapshot");
  expect(single.entries.snapshot).toBeUndefined();
  expect(single.entries.identity?.code).toBe("B");
  expect(single.resets?.snapshot).toBe("reset-one");
  expect(parseNotebook(JSON.stringify(single))).toEqual(single);
  const all = resetNotebook(single, "reset-all");
  expect(all.entries).toEqual({});
  expect(all.resets?.snapshot).toBe("reset-all");
  expect(all.resets?.identity).toBe("reset-all");
  expect(notebook.entries.snapshot?.completed).toBe(true);
});
