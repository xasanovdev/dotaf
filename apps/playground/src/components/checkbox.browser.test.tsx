import { Checkbox } from "@registry/checkbox/checkbox";
import { describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "virtual:dotaf.css";
import { contrast, sameColor } from "./contrast.js";
import { emulateMedia, pageColor, setTheme } from "./test-utils.js";

// The visible box is decoration next to the real (visually hidden) input.
function box(name: string): Element {
  const found = page
    .getByRole("checkbox", { name })
    .element()
    .closest("label")
    ?.querySelector("[aria-hidden]");
  if (found == null) throw new Error(`no box for ${name}`);
  return found;
}

describe("Checkbox", () => {
  test("Space toggles it and reports the new value", async () => {
    const onChange = vi.fn();
    await render(<Checkbox onChange={onChange}>Accept terms</Checkbox>);

    await userEvent.tab();
    await userEvent.keyboard(" ");

    await expect.element(page.getByRole("checkbox", { name: "Accept terms" })).toBeChecked();
    expect(onChange).toHaveBeenCalledWith(true);
  });

  test("clicking the label toggles it", async () => {
    await render(<Checkbox>Accept terms</Checkbox>);

    await page.getByText("Accept terms").click();

    await expect.element(page.getByRole("checkbox", { name: "Accept terms" })).toBeChecked();
  });

  test("the indeterminate state reaches assistive technology", async () => {
    await render(<Checkbox isIndeterminate>Select all</Checkbox>);

    await expect.element(page.getByRole("checkbox", { name: "Select all" })).toBePartiallyChecked();
  });

  test("the focus ring shows for keyboard focus only", async () => {
    await render(<Checkbox>Accept terms</Checkbox>);

    await userEvent.tab();
    await expect.poll(() => getComputedStyle(box("Accept terms")).outlineStyle).toBe("solid");

    await page.getByText("Accept terms").click();
    await expect.poll(() => getComputedStyle(box("Accept terms")).outlineStyle).toBe("none");
  });

  test.each(["light", "dark"] as const)("the box stays visible (3:1) in %s mode", async (theme) => {
    setTheme(theme);
    await render(
      <>
        <Checkbox>Off</Checkbox>
        <Checkbox defaultSelected>On</Checkbox>
      </>,
    );

    const off = getComputedStyle(box("Off"));
    expect(contrast(off.borderTopColor, pageColor())).toBeGreaterThanOrEqual(3);
    const on = getComputedStyle(box("On"));
    expect(contrast(on.backgroundColor, pageColor())).toBeGreaterThanOrEqual(3);
    expect(contrast(on.color, on.backgroundColor)).toBeGreaterThanOrEqual(3);
  });

  test("checked and unchecked still differ in forced colors (Windows High Contrast)", async () => {
    await emulateMedia("forced-colors", "active");
    await render(
      <>
        <Checkbox>Off</Checkbox>
        <Checkbox defaultSelected>On</Checkbox>
      </>,
    );

    const fill = (name: string) => getComputedStyle(box(name)).backgroundColor;
    expect(sameColor(fill("On"), fill("Off"))).toBe(false);
  });
});
