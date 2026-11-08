import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";

import {
  Select,
  SelectError,
  SelectItem,
  SelectLabel,
  SelectPopover,
  SelectTrigger,
  type SelectProps,
} from "./select";

import "virtual:dotaf.css";

import { contrast, sameColor } from "../../test/browser/contrast";
import {
  emulateMedia,
  pageColor,
  setTheme,
  startedAnimations,
} from "../../test/browser/test-utils";

function CountrySelect(props: Omit<SelectProps, "children">) {
  return (
    <Select placeholder="Pick a country" {...props}>
      <SelectLabel>Country</SelectLabel>
      <SelectTrigger />
      <SelectError>Pick a country to continue.</SelectError>
      <SelectPopover>
        <SelectItem id="uz">Uzbekistan</SelectItem>
        <SelectItem id="kz">Kazakhstan</SelectItem>
        <SelectItem id="kg" isDisabled>
          Kyrgyzstan
        </SelectItem>
      </SelectPopover>
    </Select>
  );
}

const trigger = () => page.getByRole("button", { name: /Country/ });
const option = (name: string) => page.getByRole("option", { name });
const listbox = () => page.getByRole("listbox");

async function open() {
  await trigger().click();
  await expect.element(listbox()).toBeVisible();
}

// The element React Aria animates: the popover around the list.
function popover(): Element {
  const found = listbox().element().parentElement;
  if (found == null) throw new Error("no popover around the list");
  return found;
}

describe("Select", () => {
  test("the list is at least as wide as the trigger", async () => {
    await render(<CountrySelect />);
    await open();

    const width = (element: Element) => element.getBoundingClientRect().width;
    expect(width(popover())).toBeGreaterThanOrEqual(width(trigger().element()) - 1);
  });

  // A list that pokes past the screen edge scrolls the page sideways when the keyboard moves
  // to an option, and React Aria closes the list on that scroll.
  test("a list under a full-width trigger stays inside the screen", async () => {
    await render(<CountrySelect />);
    await open();

    const { left, right } = popover().getBoundingClientRect();
    expect(left).toBeGreaterThanOrEqual(0);
    expect(right).toBeLessThanOrEqual(document.documentElement.clientWidth);
  });

  test.each(["light", "dark"] as const)(
    "the trigger outline and every option keep their contrast in %s mode",
    async (theme) => {
      setTheme(theme);
      await render(<CountrySelect />);

      const button = getComputedStyle(trigger().element());
      expect(contrast(button.borderTopColor, pageColor())).toBeGreaterThanOrEqual(3);

      await open();
      const surface = getComputedStyle(popover()).backgroundColor;
      for (const name of ["Uzbekistan", "Kazakhstan"]) {
        const { color } = getComputedStyle(option(name).element());
        expect(contrast(color, surface)).toBeGreaterThanOrEqual(4.5);
      }

      // Arrow keys focus an option; its highlight must keep the text readable.
      await userEvent.keyboard("{ArrowDown}");
      await expect.element(option("Uzbekistan")).toHaveFocus();
      const focused = getComputedStyle(option("Uzbekistan").element());
      expect(contrast(focused.color, focused.backgroundColor)).toBeGreaterThanOrEqual(4.5);
    },
  );

  test("the focused option still stands out in forced colors (Windows High Contrast)", async () => {
    await emulateMedia("forced-colors", "active");
    await render(<CountrySelect />);
    await open();

    await userEvent.keyboard("{ArrowDown}");
    await expect.element(option("Uzbekistan")).toHaveFocus();

    const fill = (name: string) => getComputedStyle(option(name).element()).backgroundColor;
    expect(sameColor(fill("Uzbekistan"), fill("Kazakhstan"))).toBe(false);
  });

  test("it closes faster than it opens", async () => {
    const started = startedAnimations();
    await render(<CountrySelect />);
    await open();
    const element = popover();
    await expect.poll(() => element.hasAttribute("data-entering")).toBe(false);

    await userEvent.keyboard("{Escape}");
    await expect.element(listbox()).not.toBeInTheDocument();

    const [enter, exit] = started.filter((a) => a.target === element).map((a) => a.duration);
    expect(exit).toBeLessThan(enter ?? 0);
  });

  // The duration tokens carry reduced motion, so the popover needs no media query of its own.
  test("reduced motion stops the open and close animation", async () => {
    await render(<CountrySelect />);
    await open();
    expect(getComputedStyle(popover()).animationDuration).not.toBe("0s");
    await userEvent.keyboard("{Escape}");
    await expect.element(listbox()).not.toBeInTheDocument();

    await emulateMedia("prefers-reduced-motion", "reduce");
    await open();
    expect(getComputedStyle(popover()).animationDuration).toBe("0s");
  });
});
