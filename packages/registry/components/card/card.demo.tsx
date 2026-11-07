import { Button } from "../button";
import { Card, CardBody, CardFooter, CardHeader, CardTitle } from "./card";
import styles from "./card.demo.module.css";

export default function CardDemo() {
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
