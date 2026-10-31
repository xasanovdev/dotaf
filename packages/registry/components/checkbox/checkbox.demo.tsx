import { Checkbox } from "./checkbox";
import styles from "./checkbox.demo.module.css";

export default function CheckboxDemo() {
  return (
    <div className={styles.row}>
      <Checkbox>Unchecked</Checkbox>
      <Checkbox defaultSelected>Checked</Checkbox>
      <Checkbox isIndeterminate>Indeterminate</Checkbox>
      <Checkbox isInvalid>Invalid</Checkbox>
      <Checkbox isDisabled>Disabled</Checkbox>
    </div>
  );
}
