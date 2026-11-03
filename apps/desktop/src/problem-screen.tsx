import { type LoaderFunctionArgs, useLoaderData } from "react-router";
import { findProblem } from "../../stepwise/app/problems/catalog";
import Problem from "../../stepwise/app/routes/problem";
export function loader({ params }: LoaderFunctionArgs) {
  if (!params.slug || !findProblem(params.slug))
    throw new Response("Problem not found", { status: 404 });
  return { slug: params.slug };
}
export function Component() {
  return <Problem loaderData={useLoaderData<typeof loader>()} />;
}
