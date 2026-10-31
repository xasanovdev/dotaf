import { Switch } from "./switch";
import styles from "./switch.demo.module.css";

export default function SwitchDemo() {
  return (
    <div className={styles.row}>
      <Switch>Off</Switch>
      <Switch defaultSelected>On</Switch>
      <Switch isDisabled>Disabled</Switch>
    </div>
  );
}
