import { Badge } from "@kb.ui/react";
import { Link } from "react-router";
import { problems } from "~/problems/catalog";

export const meta = () => [{ title: "Stepwise" }];

export default function Library() {
  return (
    <main className="page">
      <h1>Stepwise</h1>
      <p>Pick a problem and step through it.</p>
      <ul className="library">
        {problems.map((p) => (
          <li key={p.slug}>
            <Link to={`/problems/${p.slug}`}>{p.title}</Link> <Badge>{p.pattern}</Badge>
          </li>
        ))}
      </ul>
    </main>
  );
}
