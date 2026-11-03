import { platformLinks } from "@interview/platform";
import { redirect } from "react-router";
import type { Route } from "./+types/lab-redirect";
export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const target = new URL(platformLinks(url.hostname).lab);
  target.pathname = url.pathname;
  target.search = url.search;
  return redirect(target.href);
}
