import { data, Link } from "react-router";
import { findProblem } from "~/problems/catalog";
import { Walkthrough } from "~/walkthrough/Walkthrough";
import type { Route } from "./+types/problem";

export function loader({ params }: Route.LoaderArgs) {
  if (!findProblem(params.slug)) throw data(null, { status: 404 });
  return { slug: params.slug };
}

export const meta = ({ params }: Route.MetaArgs) => [
  { title: `${findProblem(params.slug)?.title ?? "Problem"} · Stepwise` },
];

export default function ProblemRoute({ loaderData }: Route.ComponentProps) {
  // Problems ship with the app, so the loader passes only the slug.
  const problem = findProblem(loaderData.slug);
  if (!problem) return null;
  return (
    <main className="page">
      <Link to="/" className="back-link">
        <span aria-hidden="true">← </span>Problems
      </Link>
      <h1>{problem.title}</h1>
      <Walkthrough problem={problem} />
    </main>
  );
}
