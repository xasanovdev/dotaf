import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";

import { Checkbox } from "./checkbox";

import "virtual:dotaf.css";

import { contrast, sameColor } from "../../test/browser/contrast";
import { emulateMedia, emulateTouch, pageColor, setTheme } from "../../test/browser/test-utils";

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
  // WCAG 2.5.8: a target is at least 24px; a fingertip needs about 44px.
  test("without a label it still takes a press 24px tall, and 44px on touch screens", async () => {
    await render(<Checkbox aria-label="Agree" />);
    const visible = box("Agree").getBoundingClientRect();
    const label = box("Agree").closest("label");
    const pressed = (reach: number) =>
      document
        .elementFromPoint(
          visible.x + visible.width / 2,
          visible.y + (visible.height + reach) / 2 - 1,
        )
        ?.closest("label");

    expect(pressed(24)).toBe(label);
    await emulateTouch();
    expect(pressed(44)).toBe(label);
  });
});
