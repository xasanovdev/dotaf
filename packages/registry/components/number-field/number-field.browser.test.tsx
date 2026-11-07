import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";

import {
  NumberField,
  NumberFieldDescription,
  NumberFieldError,
  NumberFieldInput,
  NumberFieldLabel,
  type NumberFieldProps,
} from "./number-field";

import "virtual:dotaf.css";

import { contrast } from "../../test/browser/contrast";
import { emulateTouch, pageColor, setTheme } from "../../test/browser/test-utils";

function Quantity(props: Omit<NumberFieldProps, "children">) {
  return (
    <NumberField defaultValue={1} minValue={1} maxValue={10} {...props}>
      <NumberFieldLabel>Quantity</NumberFieldLabel>
      <NumberFieldInput />
      <NumberFieldDescription>Up to 10 per order.</NumberFieldDescription>
      <NumberFieldError />
    </NumberField>
  );
}

const input = () => page.getByRole("textbox", { name: "Quantity" });
const increase = () => page.getByRole("button", { name: /Increase/ });
const decrease = () => page.getByRole("button", { name: /Decrease/ });

function box(): Element {
  const found = input().element().parentElement;
  if (found === null) throw new Error("no box around the input");
  return found;
}

describe("NumberField", () => {
  test("an invalid value shows the error inside a live region that was there before it", async () => {
    const { container } = await render(
      <Quantity
        validationBehavior="aria"
        validate={(value) => (value > 5 ? "Only 5 left in stock" : null)}
      />,
    );
    const region = container.querySelector('[aria-live="polite"]');
    expect(region).not.toBeNull();

    await input().fill("8");
    await userEvent.tab();

    await expect.poll(() => region?.textContent).toContain("Only 5 left in stock");
    await expect.element(input()).toHaveAccessibleDescription(/Only 5 left in stock/);
  });

  test("the focus ring goes around the whole box while the input has focus", async () => {
    await render(<Quantity />);

    await input().click();

    await expect.poll(() => getComputedStyle(box()).outlineStyle).toBe("solid");
    expect(box().contains(increase().element())).toBe(true);
  });

  test.each(["light", "dark"] as const)(
    "the box outline stays visible (3:1) in %s mode",
    async (theme) => {
      setTheme(theme);
      await render(<Quantity />);

      expect(contrast(getComputedStyle(box()).borderTopColor, pageColor())).toBeGreaterThanOrEqual(
        3,
      );
    },
  );

  test("on touch screens the text is 16px and each button is 44px", async () => {
    await render(<Quantity />);
    await emulateTouch();

    expect(getComputedStyle(input().element()).fontSize).toBe("16px");
    for (const button of [increase(), decrease()]) {
      const size = button.element().getBoundingClientRect();
      expect(size.width).toBeGreaterThanOrEqual(44);
      expect(size.height).toBeGreaterThanOrEqual(44);
    }
  });
});
