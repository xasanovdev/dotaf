import type { SyntheticEvent } from "react";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";

import { Button } from "../button";
import { TextField, TextFieldError, TextFieldInput, TextFieldLabel } from "../text-field";
import { Form, FormActions, type FormProps } from "./form";

import "virtual:dotaf.css";

function SignUp(props: Omit<FormProps, "children">) {
  return (
    <Form {...props}>
      <TextField name="email" type="email" isRequired>
        <TextFieldLabel>Email</TextFieldLabel>
        <TextFieldInput />
        <TextFieldError />
      </TextField>
      <FormActions>
        <Button variant="secondary">Cancel</Button>
        <Button type="submit">Sign up</Button>
      </FormActions>
    </Form>
  );
}

const email = () => page.getByRole("textbox", { name: "Email" });

function submitSpy() {
  return vi.fn((event: SyntheticEvent) => {
    event.preventDefault();
  });
}

describe("Form", () => {
  test("a server error lands in the field with that name", async () => {
    await render(<SignUp validationErrors={{ email: "This email is already taken" }} />);

    await expect.element(email()).toBeInvalid();
    await expect.element(email()).toHaveAccessibleDescription(/This email is already taken/);
  });

  test("changing the value and leaving the field clears its server error", async () => {
    await render(<SignUp validationErrors={{ email: "This email is already taken" }} />);

    await userEvent.type(email(), "ada@example.org");
    await userEvent.tab();

    await expect.element(email()).not.toBeInvalid();
    await expect.element(page.getByText("This email is already taken")).not.toBeInTheDocument();
  });

  test("Enter in a field submits the form", async () => {
    const onSubmit = submitSpy();
    await render(<SignUp onSubmit={onSubmit} />);

    await userEvent.type(email(), "ada@example.com{Enter}");

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  test("a missing required value stops the submit and takes focus", async () => {
    const onSubmit = submitSpy();
    await render(<SignUp onSubmit={onSubmit} />);

    await page.getByRole("button", { name: "Sign up" }).click();

    expect(onSubmit).not.toHaveBeenCalled();
    await expect.element(email()).toHaveFocus();
    await expect.element(email()).toBeInvalid();
  });

  test("validationBehavior set on the form reaches every field", async () => {
    await render(
      <Form validationBehavior="aria">
        <TextField validate={(value) => (value.includes("@") ? null : "Enter a full email")}>
          <TextFieldLabel>Email</TextFieldLabel>
          <TextFieldInput />
          <TextFieldError />
        </TextField>
      </Form>,
    );

    await userEvent.type(email(), "ada");

    await expect.element(page.getByText("Enter a full email")).toBeVisible();
  });

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
