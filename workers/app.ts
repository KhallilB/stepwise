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
    return requestHandler(request);
  },
} satisfies ExportedHandler<Env>;
