import { TextField } from "@registry/text-field/text-field";
import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "virtual:dotaf.css";
import { contrast } from "./contrast.js";
import { pageColor, setTheme } from "./test-utils.js";

function EmailField() {
  return (
    <TextField
      validationBehavior="aria"
      validate={(value) => (value === "" || value.includes("@") ? null : "Enter a valid email")}
    >
      <TextField.Label>Email</TextField.Label>
      <TextField.Input type="email" />
      <TextField.Description>We never share it.</TextField.Description>
      <TextField.Error />
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
});
