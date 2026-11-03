import { type LoaderFunctionArgs, useLoaderData } from "react-router";
import Lab, { loadChallenge } from "../../interview-lab/app/routes/react-lab";
export function loader({ params }: LoaderFunctionArgs) {
  return loadChallenge(params.id);
}
export function Component() {
  return <Lab loaderData={useLoaderData<typeof loader>()} />;
}
