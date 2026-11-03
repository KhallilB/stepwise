import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it } from "vitest";
import { verifyChecksum, writeChecksum } from "./checksum";

const directories: string[] = [];
afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((path) => rm(path, { recursive: true, force: true })),
  );
});
async function archivePath() {
  const directory = await mkdtemp(join(tmpdir(), "interview-checksum-"));
  directories.push(directory);
  return join(directory, "Interview-Practice-macos-arm64.zip");
}

it("writes the standard SHA-256 sidecar with a portable archive filename", async () => {
  const archive = await archivePath();
  await writeFile(archive, "abc");
  const manifest = await writeChecksum(archive);
  expect(manifest).toBe(`${archive}.sha256`);
  await expect(readFile(manifest, "utf8")).resolves.toBe(
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad  Interview-Practice-macos-arm64.zip\n",
  );
});

it("fails packaging when the archive cannot be read", async () => {
  const archive = await archivePath();
  await expect(writeChecksum(archive)).rejects.toThrow();
  await expect(readFile(`${archive}.sha256`)).rejects.toThrow();
});

it("rejects a runtime archive whose bytes differ from the pinned digest", async () => {
  const archive = await archivePath();
  await writeFile(archive, "abc");
  await expect(verifyChecksum(archive, "0".repeat(64))).rejects.toThrow("Checksum mismatch");
  await expect(
    verifyChecksum(archive, "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"),
  ).resolves.toBeUndefined();
});
