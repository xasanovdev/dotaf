import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";

import {
  Radio,
  RadioGroup,
  RadioGroupDescription,
  RadioGroupError,
  RadioGroupLabel,
  type RadioGroupProps,
} from "./radio-group";

import "virtual:dotaf.css";

import { contrast, sameColor } from "../../test/browser/contrast";
import { emulateMedia, emulateTouch, pageColor, setTheme } from "../../test/browser/test-utils";

function PlanGroup(props: Omit<RadioGroupProps, "children">) {
  return (
    <RadioGroup {...props}>
      <RadioGroupLabel>Plan</RadioGroupLabel>
      <Radio value="free">Free</Radio>
      <Radio value="pro">Pro</Radio>
      <Radio value="team">Team</Radio>
      <RadioGroupDescription>You can change it later.</RadioGroupDescription>
      <RadioGroupError />
    </RadioGroup>
  );
}

const radio = (name: string) => page.getByRole("radio", { name });

// The visible circle is decoration next to the real (visually hidden) input.
function circle(name: string): Element {
  const found = radio(name).element().closest("label")?.querySelector("[aria-hidden]");
  if (found == null) throw new Error(`no circle for ${name}`);
  return found;
}

describe("RadioGroup", () => {
  // A live region only announces changes inside it, so it must exist before the error does.
  test("an invalid choice shows the error in a live region and describes the group", async () => {
    const { container } = await render(
      <PlanGroup
        validationBehavior="aria"
        validate={(value) => (value === "team" ? "Team needs a seat count" : null)}
      />,
    );
    const region = container.querySelector('[aria-live="polite"]');
    expect(region).not.toBeNull();

    await page.getByText("Team").click();

    await expect.poll(() => region?.textContent).toContain("Team needs a seat count");
    await expect
      .element(page.getByRole("radiogroup"))
      .toHaveAccessibleDescription(/Team needs a seat count/);
  });

  test("the focus ring shows for keyboard focus only", async () => {
    await render(<PlanGroup defaultValue="free" />);

    await userEvent.tab();
    await expect.poll(() => getComputedStyle(circle("Free")).outlineStyle).toBe("solid");

    await page.getByText("Pro").click();
    await expect.poll(() => getComputedStyle(circle("Pro")).outlineStyle).toBe("none");
  });

  test.each(["light", "dark"] as const)(
    "the circle stays visible (3:1) in %s mode",
    async (theme) => {
      setTheme(theme);
      await render(<PlanGroup defaultValue="pro" />);

      const off = getComputedStyle(circle("Free"));
      expect(contrast(off.borderTopColor, pageColor())).toBeGreaterThanOrEqual(3);
      const on = getComputedStyle(circle("Pro"));
      expect(contrast(on.borderTopColor, pageColor())).toBeGreaterThanOrEqual(3);
    },
  );

  test("chosen and not chosen still differ in forced colors (Windows High Contrast)", async () => {
    await emulateMedia("forced-colors", "active");
    await render(<PlanGroup defaultValue="pro" />);

    // The chosen circle is a thick ring, a shape difference that survives any palette.
    const ring = (name: string) => getComputedStyle(circle(name)).borderTopWidth;
    expect(ring("Pro")).not.toBe(ring("Free"));
    const color = (name: string) => getComputedStyle(circle(name)).borderTopColor;
    expect(sameColor(color("Pro"), color("Free"))).toBe(false);
  });

  test("a horizontal group lays its options out in a row", async () => {
    await render(<PlanGroup orientation="horizontal" />);

    const top = (name: string) =>
      radio(name).element().closest("label")?.getBoundingClientRect().top;
    expect(top("Pro")).toBe(top("Free"));
    expect(top("Team")).toBe(top("Free"));
  });

  test("a horizontal group stretched taller keeps its options under the label", async () => {
    await render(
      <div style={{ display: "grid", height: 200 }}>
        <PlanGroup orientation="horizontal" />
      </div>,
    );

    // Only the label's line sits above the options: about one line of text, not a third
    // of the spare height.
    const group = page.getByRole("radiogroup").element().getBoundingClientRect();
    const option = radio("Free").element().closest("label")?.getBoundingClientRect();
    expect((option?.top ?? Infinity) - group.top).toBeLessThan(40);
  });

  // WCAG 2.5.8: a target is at least 24px; a fingertip needs about 44px.
  test("without a label it still takes a press 24px tall, and 44px on touch screens", async () => {
    await render(
      <RadioGroup aria-label="Size">
        <Radio value="s" aria-label="Small" />
      </RadioGroup>,
    );
    const visible = circle("Small").getBoundingClientRect();
    const label = circle("Small").closest("label");
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
