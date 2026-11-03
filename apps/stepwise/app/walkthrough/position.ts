export function readPosition(raw: string | null, total: number): number {
  try {
    const value = JSON.parse(raw ?? "null");
    return value?.version === 1 &&
      Number.isInteger(value.index) &&
      value.index >= 0 &&
      value.index < total
      ? value.index
      : 0;
  } catch {
    return 0;
  }
}
