import { Checkbox } from "../checkbox/checkbox";
import {
  CheckboxGroup,
  CheckboxGroupDescription,
  CheckboxGroupError,
  CheckboxGroupLabel,
} from "./checkbox-group";
import styles from "./checkbox-group.demo.module.css";

export default function CheckboxGroupDemo() {
  return (
    <div className={styles.grid}>
      <CheckboxGroup defaultValue={["email"]}>
        <CheckboxGroupLabel>Notify me by</CheckboxGroupLabel>
        <Checkbox value="email">Email</Checkbox>
        <Checkbox value="sms">SMS</Checkbox>
        <Checkbox value="push">Push</Checkbox>
        <CheckboxGroupDescription>You can change this later.</CheckboxGroupDescription>
      </CheckboxGroup>
      <CheckboxGroup orientation="horizontal" defaultValue={["mon", "wed"]}>
        <CheckboxGroupLabel>Days</CheckboxGroupLabel>
        <Checkbox value="mon">Mon</Checkbox>
        <Checkbox value="wed">Wed</Checkbox>
        <Checkbox value="fri">Fri</Checkbox>
      </CheckboxGroup>
      <CheckboxGroup
        validationBehavior="aria"
        defaultValue={[]}
        validate={(values) => (values.length === 0 ? "Pick at least one topic" : null)}
      >
        <CheckboxGroupLabel>Topics</CheckboxGroupLabel>
        <Checkbox value="design">Design</Checkbox>
        <Checkbox value="code">Code</Checkbox>
        <CheckboxGroupError />
      </CheckboxGroup>
    </div>
  );
}
