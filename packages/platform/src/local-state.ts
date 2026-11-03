export type Profile = { version: 1; displayName: string; goal: string };
export const profileKey = "interview.profile.v1";

export function parseProfile(raw: string | null): Profile | null {
  try {
    const value: unknown = JSON.parse(raw ?? "null");
    if (
      !value ||
      typeof value !== "object" ||
      !("version" in value) ||
      value.version !== 1 ||
      !("displayName" in value) ||
      !("goal" in value) ||
      typeof value.displayName !== "string" ||
      value.displayName.length > 80 ||
      typeof value.goal !== "string" ||
      value.goal.length > 200
    )
      return null;
    return { version: 1, displayName: value.displayName, goal: value.goal };
  } catch {
    return null;
  }
}

// Cache successful IO only; quota failures must leave saved state intact.
export function createLocalState<T>(
  storage: Pick<Storage, "getItem" | "setItem">,
  key: string,
  parse: (raw: string | null) => T | null,
) {
  let loaded = false;
  let cached: T | null = null;
  let serialized: string | null = null;
  function reload() {
    const raw = storage.getItem(key);
    const value = parse(raw);
    cached = value;
    serialized = value === null ? null : JSON.stringify(value);
    loaded = true;
    return cached;
  }
  return {
    read: () => (loaded ? cached : reload()),
    reload,
    write(value: T) {
      const next = JSON.stringify(value);
      const valid = parse(next);
      if (valid === null) throw new Error("Unsupported local data.");
      const normalized = JSON.stringify(valid);
      if (loaded && normalized === serialized) return;
      storage.setItem(key, normalized);
      cached = valid;
      serialized = normalized;
      loaded = true;
    },
  };
}
