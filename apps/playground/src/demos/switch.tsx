import { Switch } from "@registry/switch/switch";
import styles from "./demo.module.css";

export function SwitchDemo() {
  return (
    <div className={styles.row}>
      <Switch>Off</Switch>
      <Switch defaultSelected>On</Switch>
      <Switch isDisabled>Disabled</Switch>
    </div>
  );
}
