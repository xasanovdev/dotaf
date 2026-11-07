import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";

import {
  TextField,
  TextFieldDescription,
  TextFieldError,
  TextFieldInput,
  TextFieldLabel,
  TextFieldPasswordInput,
} from "./text-field";

import "virtual:dotaf.css";

import { contrast } from "../../test/browser/contrast";
import { emulateTouch, pageColor, setTheme } from "../../test/browser/test-utils";

function EmailField() {
  return (
    <TextField
      validationBehavior="aria"
      validate={(value) => (value === "" || value.includes("@") ? null : "Enter a valid email")}
    >
      <TextFieldLabel>Email</TextFieldLabel>
      <TextFieldInput type="email" />
      <TextFieldDescription>We never share it.</TextFieldDescription>
      <TextFieldError />
    </TextField>
  );
}

const input = () => page.getByRole("textbox", { name: "Email" });

describe("TextField", () => {
  test("the label names the input and the description describes it", async () => {
    await render(<EmailField />);

    await expect.element(input()).toHaveAccessibleDescription("We never share it.");
  });

  test("an invalid value shows the error and marks the input invalid", async () => {
    await render(<EmailField />);

    await userEvent.type(input(), "nope");

    await expect.element(input()).toBeInvalid();
    await expect.element(page.getByText("Enter a valid email")).toBeVisible();
    await expect.element(input()).toHaveAccessibleDescription(/Enter a valid email/);
  });

  // A live region only announces changes inside it, so it must exist before the error does.
  test("the error appears inside a polite live region that was there before it", async () => {
    const { container } = await render(<EmailField />);
    const region = container.querySelector('[aria-live="polite"]');
    expect(region).not.toBeNull();

    await userEvent.type(input(), "nope");

    await expect.poll(() => region?.textContent).toContain("Enter a valid email");
  });

  test("the focus ring shows on click too, since text inputs take focus to type", async () => {
    await render(<EmailField />);

    await input().click();

    await expect.poll(() => getComputedStyle(input().element()).outlineStyle).toBe("solid");
  });

  test.each(["light", "dark"] as const)(
    "the input outline stays visible (3:1) in %s mode",
    async (theme) => {
      setTheme(theme);
      await render(<EmailField />);

      const border = getComputedStyle(input().element()).borderTopColor;
      expect(contrast(border, pageColor())).toBeGreaterThanOrEqual(3);
    },
  );
  // iOS zooms the page into an input whose text is under 16px.
  test("touch screens get 16px text, so the page doesn't zoom on focus", async () => {
    await render(<EmailField />);
    await emulateTouch();

    expect(getComputedStyle(page.getByRole("textbox").element()).fontSize).toBe("16px");
  });
});

function PasswordField() {
  return (
    <TextField>
      <TextFieldLabel>Password</TextFieldLabel>
      <TextFieldPasswordInput autoComplete="current-password" />
    </TextField>
  );
}

const password = () => page.getByLabelText("Password", { exact: true });
const reveal = () => page.getByRole("button", { name: "Show password" });

describe("TextFieldPasswordInput", () => {
  test("it hides the password until the toggle shows it, and hides it again", async () => {
    await render(<PasswordField />);
    await userEvent.type(password(), "hunter2");

    await expect.element(password()).toHaveAttribute("type", "password");
    await expect.element(reveal()).toHaveAttribute("aria-pressed", "false");

    await reveal().click();
    await expect.element(password()).toHaveAttribute("type", "text");
    await expect.element(reveal()).toHaveAttribute("aria-pressed", "true");
    await expect.element(password()).toHaveValue("hunter2");

    await reveal().click();
    await expect.element(password()).toHaveAttribute("type", "password");
  });

  // Browser spellcheck services can send the text of a visible field to a server.
  test("a shown password is kept out of spellcheck and autocorrect", async () => {
    await render(<PasswordField />);

    await reveal().click();

    await expect.element(password()).toHaveAttribute("spellcheck", "false");
    await expect.element(password()).toHaveAttribute("autocapitalize", "off");
  });

  test("Tab goes from the password to the toggle, and Space toggles it", async () => {
    await render(<PasswordField />);

    await userEvent.tab();
    await expect.element(password()).toHaveFocus();
    await userEvent.tab();
    await expect.element(reveal()).toHaveFocus();
    await userEvent.keyboard(" ");

    await expect.element(password()).toHaveAttribute("type", "text");
  });

  test("the focus ring goes around the whole box while the password has focus", async () => {
    await render(<PasswordField />);

    await password().click();

    const box = password().element().parentElement;
    if (box === null) throw new Error("no box around the input");
    await expect.poll(() => getComputedStyle(box).outlineStyle).toBe("solid");
    expect(box.contains(reveal().element())).toBe(true);
  });

  test.each(["light", "dark"] as const)(
    "the box outline stays visible (3:1) in %s mode",
    async (theme) => {
      setTheme(theme);
      await render(<PasswordField />);

      const box = password().element().parentElement;
      if (box === null) throw new Error("no box around the input");
      expect(contrast(getComputedStyle(box).borderTopColor, pageColor())).toBeGreaterThanOrEqual(3);
    },
  );

  test("on touch screens the text is 16px and the toggle is 44px", async () => {
    await render(<PasswordField />);
    await emulateTouch();

    expect(getComputedStyle(password().element()).fontSize).toBe("16px");
    const toggle = reveal().element().getBoundingClientRect();
    expect(toggle.width).toBeGreaterThanOrEqual(44);
    expect(toggle.height).toBeGreaterThanOrEqual(44);
  });
});
