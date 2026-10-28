import {
  TextField,
  TextFieldLabel,
  TextFieldInput,
  TextFieldDescription,
  TextFieldError,
} from "@registry/text-field";
import styles from "./demo.module.css";

export function TextFieldDemo() {
  return (
    <div className={styles.grid}>
      <TextField>
        <TextFieldLabel>Name</TextFieldLabel>
        <TextFieldInput placeholder="Ada Lovelace" />
      </TextField>
      <TextField
        validationBehavior="aria"
        defaultValue="ada@"
        validate={(value) => (value.includes(".") ? null : "Enter a full email address")}
      >
        <TextFieldLabel>Email</TextFieldLabel>
        <TextFieldInput type="email" />
        <TextFieldDescription>We never share it.</TextFieldDescription>
        <TextFieldError />
      </TextField>
      <TextField isDisabled defaultValue="Read only for now">
        <TextFieldLabel>Disabled</TextFieldLabel>
        <TextFieldInput />
      </TextField>
    </div>
  );
}
