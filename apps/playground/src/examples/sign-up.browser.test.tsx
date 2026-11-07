import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";

import "virtual:dotaf.css";

import { SignUp } from "./sign-up.js";

const email = () => page.getByRole("textbox", { name: "Email" });
const password = () => page.getByLabelText("Password", { exact: true });
const country = () => page.getByRole("combobox", { name: "Country" });
const submit = () => page.getByRole("button", { name: "Create account" });

async function fillIn(address: string) {
  await userEvent.type(email(), address);
  await userEvent.type(password(), "correct horse battery");
  await userEvent.type(country(), "uzb");
  await userEvent.keyboard("{ArrowDown}{Enter}");
}

test("the card is named by its title and holds every field", async () => {
  await render(<SignUp />);

  const card = page.getByRole("article", { name: "Create your account" });
  await expect.element(card.getByRole("textbox", { name: "Email" })).toBeVisible();
  await expect.element(card.getByRole("combobox", { name: "Country" })).toBeVisible();
  await expect.element(card.getByRole("group", { name: "Email me about" })).toBeVisible();
  await expect.element(card.getByRole("checkbox", { name: "Product updates" })).toBeChecked();
});

test("a missing required field stops the submit and takes focus", async () => {
  await render(<SignUp />);

  await submit().click();

  await expect.element(email()).toHaveFocus();
  await expect.element(page.getByRole("status")).toBeEmptyDOMElement();
});

test("a taken email comes back as an error on the email field", async () => {
  await render(<SignUp />);

  await fillIn("ada@example.com");
  await submit().click();

  await expect.element(email()).toHaveAccessibleDescription(/already exists/);
  await expect.element(page.getByRole("status")).toBeEmptyDOMElement();
});

test("a complete form confirms in a status message", async () => {
  await render(<SignUp />);

  await fillIn("grace@example.com");
  await submit().click();

  await expect.element(page.getByRole("status")).toHaveTextContent("Account created");
});
