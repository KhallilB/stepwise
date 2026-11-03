import { parseReview } from "../../interview-lab/app/react-lab/coach";

for (const name of ["live-review-result.json", "live-ipc-review-result.json"]) {
  const output = await Bun.file(`src-tauri/target/${name}`).json();
  if (output.model !== "qwen2.5-coder:7b" || !parseReview(output.review))
    throw new Error(`${name}: real feedback rejected by frontend parser`);
  console.log(`${name}: actual local model feedback accepted by frontend schema`);
}
