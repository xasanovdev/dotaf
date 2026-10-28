import { TextField } from "@registry/text-field/text-field";
import styles from "./demo.module.css";

export function TextFieldDemo() {
  return (
    <div className={styles.grid}>
      <TextField>
        <TextField.Label>Name</TextField.Label>
        <TextField.Input placeholder="Ada Lovelace" />
      </TextField>
      <TextField
        validationBehavior="aria"
        defaultValue="ada@"
        validate={(value) => (value.includes(".") ? null : "Enter a full email address")}
      >
        <TextField.Label>Email</TextField.Label>
        <TextField.Input type="email" />
        <TextField.Description>We never share it.</TextField.Description>
        <TextField.Error />
      </TextField>
      <TextField isDisabled defaultValue="Read only for now">
        <TextField.Label>Disabled</TextField.Label>
        <TextField.Input />
      </TextField>
    </div>
  );
}
