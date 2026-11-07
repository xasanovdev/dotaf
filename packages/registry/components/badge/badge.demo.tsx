import { Badge } from "./badge";
import styles from "./badge.demo.module.css";

export default function BadgeDemo() {
  return (
    <div className={styles.row}>
      <Badge>Draft</Badge>
      <Badge variant="primary">New</Badge>
      <Badge variant="success">Active</Badge>
      <Badge variant="warning">Expiring</Badge>
      <Badge variant="danger">Failed</Badge>
    </div>
  );
}
