import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { Button } from "../button";
import { TextField, TextFieldInput, TextFieldLabel } from "../text-field";
import { Form, FormActions, type FormProps } from "./form";

import "virtual:dotaf.css";

function SignUp(props: Omit<FormProps, "children">) {
  return (
    <Form {...props}>
      <TextField name="email" type="email">
        <TextFieldLabel>Email</TextFieldLabel>
        <TextFieldInput />
      </TextField>
      <FormActions>
        <Button variant="secondary">Cancel</Button>
        <Button type="submit">Sign up</Button>
      </FormActions>
    </Form>
  );
}

describe("Form", () => {
  test("the actions sit in one row at the end of the form", async () => {
    const { container } = await render(<SignUp />);

    const form = container.querySelector("form")?.getBoundingClientRect();
    const cancel = page.getByRole("button", { name: "Cancel" }).element().getBoundingClientRect();
    const submit = page.getByRole("button", { name: "Sign up" }).element().getBoundingClientRect();
    expect(cancel.top).toBe(submit.top);
    expect(cancel.right).toBeLessThan(submit.left);
    expect(submit.right).toBe(form?.right);
  });
});
