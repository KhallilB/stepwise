import { index, type RouteConfig, route } from "@react-router/dev/routes";
export default [
  index("routes/home.tsx"),
  route("react-lab/:id?", "routes/react-lab.tsx"),
  route("prep", "routes/prep.tsx"),
  route("profile", "routes/profile.tsx"),
] satisfies RouteConfig;
