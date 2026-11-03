import { mkdir } from "node:fs/promises";
import { communicationReviewSchema, reviewSchema } from "../../interview-lab/app/react-lab/coach";
import { challenges } from "../../interview-lab/app/react-lab/curriculum";
import {
  communicationInstructions,
  reviewInstructions,
} from "../../interview-lab/app/react-lab/review-prompt";

const runtime = Bun.spawn(["bun", "run", "lab:runtime"], {
  cwd: "../interview-lab",
  stdout: "inherit",
  stderr: "inherit",
});
if (await runtime.exited) throw new Error("Lab runtime build failed.");
await mkdir("public", { recursive: true });
await Bun.write(
  "public/react-lab-runtime.js",
  Bun.file("../interview-lab/public/react-lab-runtime.js"),
);
await mkdir("src-tauri/generated", { recursive: true });
await Bun.write(
  "src-tauri/generated/review-catalog.json",
  JSON.stringify({
    instructions: reviewInstructions,
    schema: reviewSchema,
    communicationSchema: communicationReviewSchema,
    communicationInstructions,
    challenges: challenges.map(
      ({ id, title, brief, requirements, stages, kind, buildBrief, debugBrief }) => ({
        id,
        kind,
        buildBrief,
        debugBrief,
        title,
        brief,
        requirements,
        stages: stages?.map(({ title, constraints }) => ({ title, constraints })),
      }),
    ),
  }),
);
