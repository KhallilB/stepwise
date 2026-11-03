import { mkdir } from "node:fs/promises";
import { reviewSchema } from "../../interview-lab/app/react-lab/coach";
import { challenges } from "../../interview-lab/app/react-lab/curriculum";
import { reviewInstructions } from "../../interview-lab/app/react-lab/review-prompt";

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
    challenges: challenges.map(
      ({ id, title, brief, requirements, rubric, stages, kind, buildBrief, debugBrief }) => ({
        id,
        kind,
        buildBrief,
        debugBrief,
        title,
        brief,
        requirements,
        rubric,
        stages: stages?.map(({ title, constraints }) => ({ title, constraints })),
      }),
    ),
  }),
);
