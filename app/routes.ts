import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
  index("routes/library.tsx"),
  route("problems/:slug", "routes/problem.tsx"),
] satisfies RouteConfig;
