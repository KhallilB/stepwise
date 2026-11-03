import { Container, Heading } from "@kb.ui/react";
import { data, Link } from "react-router";
import { findProblem } from "~/problems/catalog";
import { Walkthrough } from "~/walkthrough/Walkthrough";

export function loader({ params }: { params: { slug?: string } }) {
  if (!params.slug || !findProblem(params.slug)) throw data(null, { status: 404 });
  return { slug: params.slug };
}

export const meta = ({ params }: { params: { slug?: string } }) => [
  { title: `${findProblem(params.slug ?? "")?.title ?? "Problem"} · Stepwise` },
];

export default function ProblemRoute({ loaderData }: { loaderData: { slug: string } }) {
  // Problems ship with the app, so the loader passes only the slug.
  const problem = findProblem(loaderData.slug);
  if (!problem) return null;
  return (
    <Container as="main" className="screen">
      <Link to="/" className="back-link">
        <span aria-hidden="true">← </span>Problems
      </Link>
      <Heading level={1}>{problem.title}</Heading>
      <Walkthrough key={problem.slug} problem={problem} />
    </Container>
  );
}
