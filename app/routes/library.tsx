import { Badge, Card, Container, Grid, Heading, Inline, Text } from "@kb.ui/react";
import { Link } from "react-router";
import { problems } from "~/problems/catalog";

export const meta = () => [{ title: "Stepwise" }];

export default function Library() {
  return (
    <Container as="main" className="screen">
      <Grid layout="stack">
        <div>
          <Heading level={1}>Stepwise</Heading>
          <Text>Pick a problem and step through it.</Text>
        </div>
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
