import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { writeFile } from "node:fs/promises";
import { basename } from "node:path";

export async function sha256File(archive: string): Promise<string> {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(archive)) hash.update(chunk);
  return hash.digest("hex");
}

export async function verifyChecksum(archive: string, expected: string): Promise<void> {
  if ((await sha256File(archive)) !== expected)
    throw new Error(`Checksum mismatch: ${basename(archive)}`);
}

export async function writeChecksum(archive: string): Promise<string> {
  const manifest = `${archive}.sha256`;
  await writeFile(manifest, `${await sha256File(archive)}  ${basename(archive)}\n`);
  return manifest;
}
