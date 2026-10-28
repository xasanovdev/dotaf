import { Button } from "@registry/button";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";

import "virtual:dotaf.css";

import { contrast, sameColor } from "./contrast.js";
import { emulateMedia, setTheme, tokenColor } from "./test-utils.js";

const variants = ["primary", "secondary", "ghost", "danger"] as const;
const button = (name: string) => page.getByRole("button", { name }).element();

describe("Button", () => {
  test("Enter and Space press it from the keyboard", async () => {
    const onPress = vi.fn();
    await render(<Button onPress={onPress}>Save</Button>);

    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");

    expect(onPress).toHaveBeenCalledTimes(2);
  });

  test("the focus ring shows for keyboard focus, not for a click", async () => {
    await render(<Button>Save</Button>);

    await userEvent.tab();
    await expect.poll(() => getComputedStyle(button("Save")).outlineStyle).toBe("solid");

    await page.getByRole("button", { name: "Save" }).click();
    await expect.poll(() => getComputedStyle(button("Save")).outlineStyle).toBe("none");
  });

  test("filled variants paint their tokens", async () => {
    await render(
      <>
        <Button variant="primary">Primary</Button>
        <Button variant="danger">Danger</Button>
      </>,
    );

    const background = (name: string) => getComputedStyle(button(name)).backgroundColor;
    expect(sameColor(background("Primary"), tokenColor("--dotaf-color-primary"))).toBe(true);
    expect(sameColor(background("Danger"), tokenColor("--dotaf-color-danger"))).toBe(true);
  });

  // The duration tokens carry reduced motion, so no component needs its own media query.
  test("reduced motion stops the hover transition", async () => {
    await render(<Button>Save</Button>);
    expect(getComputedStyle(button("Save")).transitionDuration).not.toBe("0s");

    await emulateMedia("prefers-reduced-motion", "reduce");

    const durations = () => getComputedStyle(button("Save")).transitionDuration.split(", ");
    await expect.poll(() => durations().every((duration) => duration === "0s")).toBe(true);
  });

  test("a disabled button ignores presses", async () => {
    const onPress = vi.fn();
    await render(
      <Button isDisabled onPress={onPress}>
        Save
      </Button>,
    );

    await page.getByRole("button", { name: "Save" }).click({ force: true });

    expect(onPress).not.toHaveBeenCalled();
    await expect.element(page.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  test.each(["light", "dark"] as const)(
    "every variant keeps 4.5:1 text contrast, at rest and hovered, in %s mode",
    async (theme) => {
      setTheme(theme);
      await render(
        <>
          {variants.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </>,
      );

      for (const variant of variants) {
        // Ghost has no fill of its own, so its text sits on the page.
        const textContrast = () => {
          const { color, backgroundColor } = getComputedStyle(button(variant));
          const fill = variant === "ghost" ? tokenColor("--dotaf-color-bg") : backgroundColor;
          return contrast(color, fill);
        };
        expect(textContrast()).toBeGreaterThanOrEqual(4.5);
        await page.getByRole("button", { name: variant }).hover();
        await expect.poll(() => button(variant).hasAttribute("data-hovered")).toBe(true);
        expect(textContrast()).toBeGreaterThanOrEqual(4.5);
      }
    },
  );
});
