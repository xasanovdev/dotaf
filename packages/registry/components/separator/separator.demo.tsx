import { Separator } from "./separator";
import styles from "./separator.demo.module.css";

export default function SeparatorDemo() {
  return (
    <div className={styles.stack}>
      <p>Account</p>
      <Separator />
      <p>Notifications</p>
      <div className={styles.row}>
        <span>Docs</span>
        <Separator orientation="vertical" />
        <span>Changelog</span>
        <Separator orientation="vertical" />
        <span>Support</span>
      </div>
    </div>
  );
}
