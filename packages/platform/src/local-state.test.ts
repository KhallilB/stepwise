import { describe, expect, it } from "vitest";
import { createLocalState, parseProfile, profileKey } from "./local-state";

const profile = { version: 1 as const, displayName: "Sam", goal: "Frontend interviews" };

describe("local profile", () => {
  it("reads supported profiles and rejects corrupt, oversized and future data", () => {
    expect(parseProfile(JSON.stringify(profile))).toEqual(profile);
    for (const raw of [
      null,
      "bad json",
      "[]",
      '{"version":2}',
      JSON.stringify({ ...profile, displayName: "x".repeat(81) }),
      JSON.stringify({ ...profile, goal: null }),
    ]) {
      expect(parseProfile(raw)).toBeNull();
    }
    expect(parseProfile(JSON.stringify({ ...profile, token: "must not retain" }))).toEqual(profile);
  });

  it("caches reads, skips unchanged writes, and reloads external changes", () => {
    let reads = 0,
      writes = 0,
      value: string | null = null;
    const storage = {
      getItem: () => {
        reads++;
        return value;
      },
      setItem: (_: string, next: string) => {
        writes++;
        value = next;
      },
    };
    const state = createLocalState(storage, profileKey, parseProfile);
    expect(state.read()).toBeNull();
    expect(state.read()).toBeNull();
    expect(reads).toBe(1);
    state.write(profile);
    state.write(profile);
    expect(writes).toBe(1);
    value = JSON.stringify({ ...profile, displayName: "Alex" });
    expect(state.reload()?.displayName).toBe("Alex");
    expect(reads).toBe(2);
  });

  it("rejects invalid writes and preserves last saved profile after quota errors", () => {
    const storage = {
      getItem: () => JSON.stringify(profile),
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    };
    const state = createLocalState(storage, profileKey, parseProfile);
    expect(state.read()).toEqual(profile);
    expect(() => state.write({ ...profile, displayName: "x".repeat(81) })).toThrow();
    expect(() => state.write({ ...profile, displayName: "Changed" })).toThrow("QuotaExceededError");
    expect(state.read()).toEqual(profile);
  });
});
