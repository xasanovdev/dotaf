import { Checkbox } from "@registry/checkbox";

import styles from "./demo.module.css";

export function CheckboxDemo() {
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
