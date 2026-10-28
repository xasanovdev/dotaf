import { Button } from "@registry/button";
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from "@registry/card";
import styles from "./demo.module.css";

export function CardDemo() {
  return (
    <div className={styles.grid}>
      <Card>
        <CardHeader>
          <CardTitle>Pro plan</CardTitle>
          $12 per month
        </CardHeader>
        <CardBody>Unlimited projects and priority support.</CardBody>
        <CardFooter>
          <Button variant="secondary">Compare</Button>
          <Button>Upgrade</Button>
        </CardFooter>
      </Card>
      <Card>
        <CardTitle>Body only</CardTitle>
        <CardBody>A card without a header or footer still gets its name from the title.</CardBody>
      </Card>
    </div>
  );
}
