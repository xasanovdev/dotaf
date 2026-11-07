import { useState } from "react";

import { Button } from "../button/button";
import {
  TextField,
  TextFieldDescription,
  TextFieldError,
  TextFieldInput,
  TextFieldLabel,
} from "../text-field/text-field";
import { Form, FormActions, type FormProps } from "./form";
import styles from "./form.demo.module.css";

export default function FormDemo() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");

  // Stands in for a server that already knows one address.
  const submit: NonNullable<FormProps["onSubmit"]> = (event) => {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    if (email === "ada@example.com") {
      setErrors({ email: "This email is already taken" });
      setStatus("");
    } else {
      setErrors({});
      setStatus("Invite sent");
    }
  };

  return (
    <div className={styles.frame}>
      <Form validationErrors={errors} onSubmit={submit}>
        <TextField name="name" isRequired>
          <TextFieldLabel>Name</TextFieldLabel>
          <TextFieldInput autoComplete="name" />
          <TextFieldError />
        </TextField>
        <TextField name="email" type="email" isRequired>
          <TextFieldLabel>Email</TextFieldLabel>
          <TextFieldInput autoComplete="email" />
          <TextFieldDescription>Try ada@example.com to see a server error.</TextFieldDescription>
          <TextFieldError />
        </TextField>
        <FormActions>
          <span role="status" className={styles.status}>
            {status}
          </span>
          <Button variant="secondary" type="reset">
            Clear
          </Button>
          <Button type="submit">Send invite</Button>
        </FormActions>
      </Form>
    </div>
  );
}
