import { platformLinks } from "@interview/platform";
import { Badge, Card, Container, Grid, Heading, Inline, Text } from "@kb.ui/react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { problems } from "~/problems/catalog";

export const meta = () => [{ title: "Stepwise" }];

export default function Library() {
  const [links, setLinks] = useState(platformLinks(""));
  useEffect(() => setLinks(platformLinks(location.hostname)), []);
  return (
    <Container as="main" className="screen">
      <Grid layout="stack">
        <div>
          <Heading level={1}>Stepwise</Heading>
          <Text>Interview platform · Algorithm walkthroughs</Text>
          <Link to="/profile">Your practice profile</Link>
          {links.stepwise === "/" && <Link to="/local-model">Local reviewer</Link>}
          <Text>Pick a problem and step through it.</Text>
        </div>
        <Card>
          <Heading level={2} size="md">
            <a href={links.lab}>Frontend practice</a>
          </Heading>
          <Text>
            Hands-on React practice for senior frontend interviews. Build, debug, and explain.
          </Text>
        </Card>
        <Grid as="ul" className="library">
          {problems.map((p) => (
            <Card as="li" key={p.slug}>
              <Inline gap="sm" align="center">
                <Link to={`/problems/${p.slug}`}>{p.title}</Link>
                <Badge>{p.pattern}</Badge>
                <Badge>{p.difficulty}</Badge>
              </Inline>
            </Card>
          ))}
        </Grid>
      </Grid>
    </Container>
  );
}
