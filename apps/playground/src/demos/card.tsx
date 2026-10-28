import { Button } from "@registry/button/button";
import { Card } from "@registry/card/card";
import styles from "./demo.module.css";

export function CardDemo() {
  return (
    <div className={styles.grid}>
      <Card>
        <Card.Header>
          <Card.Title>Pro plan</Card.Title>
          $12 per month
        </Card.Header>
        <Card.Body>Unlimited projects and priority support.</Card.Body>
        <Card.Footer>
          <Button variant="secondary">Compare</Button>
          <Button>Upgrade</Button>
        </Card.Footer>
      </Card>
      <Card>
        <Card.Title>Body only</Card.Title>
        <Card.Body>A card without a header or footer still gets its name from the title.</Card.Body>
      </Card>
    </div>
  );
}
