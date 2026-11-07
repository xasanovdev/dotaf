import { describe, expect, test, vi } from "vitest";
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
  test("the label names the input and the description describes it", async () => {
    await render(<Quantity />);

    await expect.element(input()).toHaveAccessibleDescription("Up to 10 per order.");
  });

  test("the + and − buttons step the value and report it", async () => {
    const onChange = vi.fn();
    await render(<Quantity onChange={onChange} />);

    await increase().click();
    await increase().click();
    await expect.element(input()).toHaveValue("3");
    await decrease().click();

    await expect.element(input()).toHaveValue("2");
    expect(onChange).toHaveBeenLastCalledWith(2);
  });

  test("arrow keys step the value from the keyboard", async () => {
    await render(<Quantity />);

    await input().click();
    await userEvent.keyboard("{ArrowUp}{ArrowUp}{ArrowDown}");

    await expect.element(input()).toHaveValue("2");
  });

  test("the buttons stop at the limits", async () => {
    await render(<Quantity defaultValue={10} />);

    await expect.element(increase()).toBeDisabled();
    await expect.element(decrease()).toBeEnabled();
  });

  // The steppers repeat what the arrow keys do, so Tab skips them.
  test("Tab goes past the buttons to the next control", async () => {
    await render(
      <>
        <Quantity />
        <button type="button">Next</button>
      </>,
    );

    await userEvent.tab();
    await expect.element(input()).toHaveFocus();
    await userEvent.tab();
    await expect.element(page.getByRole("button", { name: "Next" })).toHaveFocus();
  });

  test("formatOptions show the value as currency once the field is left", async () => {
    await render(
      <NumberField defaultValue={5} formatOptions={{ style: "currency", currency: "USD" }}>
        <NumberFieldLabel>Price</NumberFieldLabel>
        <NumberFieldInput />
      </NumberField>,
    );

    await expect.element(page.getByRole("textbox", { name: "Price" })).toHaveValue("$5.00");
  });

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
