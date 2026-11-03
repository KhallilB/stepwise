import { createRequestHandler } from "react-router";
import { handleCoachRequest, readCoachConfig } from "./react-lab-ai";

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname.startsWith("/api/react-lab/")) {
      return handleCoachRequest(request, readCoachConfig(env, import.meta.env.DEV));
    }
    const response = await requestHandler(request);
    const headers = new Headers(response.headers);
    // Parent policy also restricts navigation from opaque srcDoc previews.
    headers.append("Content-Security-Policy", "frame-src 'self'");
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
} satisfies ExportedHandler<Env>;
