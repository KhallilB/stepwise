import kbuiStyles from "@kb.ui/react/styles.css?raw";
import type { Check } from "./types";

export type CheckResult = { name: string; passed: boolean; detail: string };

// Opaque frame + CSP deny storage access, network, forms, and top navigation.
export function previewDocument(
  runtime: string,
  code: string,
  checks: Check[],
  runId: string,
): string {
  const boot = JSON.stringify({ code, checks, runId }).replaceAll("<", "\\u003c");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'"><style>${kbuiStyles}
  *{box-sizing:border-box}body{margin:0;min-height:100vh;padding:24px;color:var(--kb-color-fg);background:var(--kb-material-surface-bg);font:14px/1.6 var(--kb-font-sans)}h2{font-size:20px;letter-spacing:-.03em;margin:0 0 20px}button,input,textarea{font:inherit;color:inherit}button{min-height:40px;padding:8px 14px;margin:6px 8px 6px 0;border:1px solid var(--kb-material-control-border);border-radius:var(--kb-radius-md);background:var(--kb-color-surface);color:var(--kb-color-fg);cursor:pointer}button:disabled{opacity:.6;cursor:default}button:focus-visible,input:focus-visible{outline:3px solid var(--kb-color-ring);outline-offset:3px}label{display:block;margin:12px 0}input{display:block;width:100%;padding:9px;border:1px solid var(--kb-material-control-border);border-radius:var(--kb-radius-md);background:var(--kb-material-field-bg)}output{font:600 28px/1.5 var(--kb-font-mono);display:block;margin:12px 0}[role=alert]{color:var(--kb-color-danger)}ul{padding-left:22px}
  </style></head><body><div id="root"></div><script>${runtime.replace(/<\/script/gi, "<\\/script")}\nwindow.startReactLab(${boot});</script></body></html>`;
}

export function readResults(value: unknown, runId: string, checks: Check[]): CheckResult[] | null {
  if (!value || typeof value !== "object") return null;
  const message = value as Record<string, unknown>;
  if (
    message.channel !== "stepwise-react-lab" ||
    message.runId !== runId ||
    message.type !== "results" ||
    !Array.isArray(message.results) ||
    message.results.length !== checks.length
  )
    return null;
  const results: CheckResult[] = [];
  for (const [index, item] of message.results.entries()) {
    if (
      !item ||
      typeof item !== "object" ||
      item.name !== checks[index]?.name ||
      typeof item.passed !== "boolean" ||
      typeof item.detail !== "string"
    )
      return null;
    results.push({ name: item.name, passed: item.passed, detail: item.detail.slice(0, 1000) });
  }
  return results;
}
