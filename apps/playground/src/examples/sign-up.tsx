import { Button } from "@registry/button";
import { Card, CardBody, CardHeader, CardTitle } from "@registry/card";
import { Checkbox } from "@registry/checkbox";
import {
  CheckboxGroup,
  CheckboxGroupDescription,
  CheckboxGroupLabel,
} from "@registry/checkbox-group";
import {
  Combobox,
  ComboboxError,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxPopover,
} from "@registry/combobox";
import { Form, FormActions, type FormProps } from "@registry/form";
import {
  NumberField,
  NumberFieldDescription,
  NumberFieldInput,
  NumberFieldLabel,
} from "@registry/number-field";
import {
  TextField,
  TextFieldDescription,
  TextFieldError,
  TextFieldInput,
  TextFieldLabel,
  TextFieldPasswordInput,
} from "@registry/text-field";
import { useState } from "react";

import styles from "./sign-up.module.css";

const countries = [
  { id: "de", name: "Germany" },
  { id: "jp", name: "Japan" },
  { id: "kz", name: "Kazakhstan" },
  { id: "uz", name: "Uzbekistan" },
  { id: "us", name: "United States" },
];

// Stands in for a server that already has an account for this address.
const TAKEN_EMAIL = "ada@example.com";

export function SignUp() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");

  const submit: NonNullable<FormProps["onSubmit"]> = (event) => {
    event.preventDefault();
    if (new FormData(event.currentTarget).get("email") === TAKEN_EMAIL) {
      setErrors({ email: "An account with this email already exists" });
      setStatus("");
      return;
    }
    setErrors({});
    setStatus("Account created");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <p className={styles.description}>Free for teams of up to 3.</p>
      </CardHeader>
      <CardBody>
        <Form validationErrors={errors} onSubmit={submit}>
          <TextField name="email" type="email" isRequired>
            <TextFieldLabel>Email</TextFieldLabel>
            <TextFieldInput autoComplete="email" />
            <TextFieldDescription>
              {TAKEN_EMAIL} is taken, to show a server error.
            </TextFieldDescription>
            <TextFieldError />
          </TextField>
          <TextField name="password" isRequired minLength={12}>
            <TextFieldLabel>Password</TextFieldLabel>
            <TextFieldPasswordInput autoComplete="new-password" />
            <TextFieldDescription>At least 12 characters.</TextFieldDescription>
            <TextFieldError />
          </TextField>
          <Combobox name="country" isRequired>
            <ComboboxLabel>Country</ComboboxLabel>
            <ComboboxInput placeholder="Type to search" />
            <ComboboxError />
            <ComboboxPopover items={countries}>
              {(country) => <ComboboxItem>{country.name}</ComboboxItem>}
            </ComboboxPopover>
          </Combobox>
          <NumberField name="seats" defaultValue={1} minValue={1} maxValue={3}>
            <NumberFieldLabel>Seats</NumberFieldLabel>
            <NumberFieldInput />
            <NumberFieldDescription>You can add more later.</NumberFieldDescription>
          </NumberField>
          <CheckboxGroup name="updates" defaultValue={["product"]}>
            <CheckboxGroupLabel>Email me about</CheckboxGroupLabel>
            <Checkbox value="product">Product updates</Checkbox>
            <Checkbox value="tips">Tips and guides</Checkbox>
            <CheckboxGroupDescription>Unsubscribe from any email.</CheckboxGroupDescription>
          </CheckboxGroup>
          <FormActions>
            {/* Rendered while empty, so screen readers already watch it when the message appears. */}
            <span role="status" className={styles.status}>
              {status}
            </span>
            <Button type="submit">Create account</Button>
          </FormActions>
        </Form>
      </CardBody>
    </Card>
  );
}
