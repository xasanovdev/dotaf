import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { Spinner, type SpinnerProps } from "./spinner";

import "virtual:dotaf.css";

import { sameColor } from "../../test/browser/contrast";
import { emulateMedia } from "../../test/browser/test-utils";

const variants = ["ring", "dots", "petals"] as const satisfies readonly NonNullable<
  SpinnerProps["variant"]
>[];

const spinner = (name = "Loading") => page.getByRole("progressbar", { name }).element();

/** The spinner's parts that paint, with the color each one paints in. */
function paints(root: Element): string[] {
  return [...root.querySelectorAll("*")].flatMap((part) => {
    const style = getComputedStyle(part);
    if (part instanceof SVGElement) return style.stroke === "none" ? [] : [style.stroke];
    return sameColor(style.backgroundColor, "rgba(0, 0, 0, 0)") ? [] : [style.backgroundColor];
  });
}

/** Every part of the spinner that runs an animation. */
function animated(root: Element): Element[] {
  return [...root.querySelectorAll("*")].filter(
    (part) => getComputedStyle(part).animationName !== "none",
  );
}

describe("Spinner", () => {
  test("screen readers hear a busy progress bar named Loading, with no value", async () => {
    await render(<Spinner />);

    await expect.element(page.getByRole("progressbar", { name: "Loading" })).toBeVisible();
    expect(spinner().getAttribute("aria-valuenow")).toBeNull();
  });

  test("a label says what is loading", async () => {
    await render(<Spinner aria-label="Loading invoices" />);

    await expect.element(page.getByRole("progressbar", { name: "Loading invoices" })).toBeVisible();
  });

  test.each(variants)("%s draws in the color of the text around it", async (variant) => {
    await render(
      <div style={{ color: "rgb(200, 0, 0)" }}>
        <Spinner variant={variant} />
      </div>,
    );

    const colors = paints(spinner());
    expect(colors.length).toBeGreaterThan(0);
    expect(colors.some((color) => sameColor(color, "rgb(200, 0, 0)"))).toBe(true);
  });

  test.each(variants)("%s grows with size and stays square", async (variant) => {
    await render(
      <>
        <Spinner variant={variant} size="sm" aria-label="sm" />
        <Spinner variant={variant} size="md" aria-label="md" />
        <Spinner variant={variant} size="lg" aria-label="lg" />
      </>,
    );

    const [sm, md, lg] = ["sm", "md", "lg"].map((size) => spinner(size).getBoundingClientRect());
    expect(sm?.width).toBeLessThan(md?.width ?? 0);
    expect(md?.width).toBeLessThan(lg?.width ?? 0);
    for (const box of [sm, md, lg]) expect(box?.width).toBe(box?.height);
  });

  // The duration tokens carry reduced motion, so the spinner needs no media query of its own;
  // it stops where it stands and its shape still reads as busy.
  test.each(variants)("%s moves, and reduced motion holds it still", async (variant) => {
    await render(<Spinner variant={variant} />);

    const moving = animated(spinner());
    expect(moving.length).toBeGreaterThan(0);
    for (const part of moving) expect(getComputedStyle(part).animationDuration).not.toBe("0s");

    await emulateMedia("prefers-reduced-motion", "reduce");

    await expect
      .poll(() =>
        animated(spinner()).every((part) => getComputedStyle(part).animationDuration === "0s"),
      )
      .toBe(true);
    expect(paints(spinner()).length).toBeGreaterThan(0);
  });
});
