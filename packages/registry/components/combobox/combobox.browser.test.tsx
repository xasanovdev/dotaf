import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";

import {
  Combobox,
  ComboboxDescription,
  ComboboxError,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxPopover,
  type ComboboxProps,
} from "./combobox";

import "virtual:dotaf.css";

import { contrast, sameColor } from "../../test/browser/contrast";
import {
  emulateMedia,
  emulateTouch,
  pageColor,
  setTheme,
  startedAnimations,
} from "../../test/browser/test-utils";

function CountryBox(props: Omit<ComboboxProps, "children">) {
  return (
    <Combobox {...props}>
      <ComboboxLabel>Country</ComboboxLabel>
      <ComboboxInput placeholder="Type to search" />
      <ComboboxDescription>Where you pay taxes.</ComboboxDescription>
      <ComboboxError />
      <ComboboxPopover>
        <ComboboxItem id="uz">Uzbekistan</ComboboxItem>
        <ComboboxItem id="kz">Kazakhstan</ComboboxItem>
        <ComboboxItem id="kg">Kyrgyzstan</ComboboxItem>
        <ComboboxItem id="tj" isDisabled>
          Tajikistan
        </ComboboxItem>
      </ComboboxPopover>
    </Combobox>
  );
}

const input = () => page.getByRole("combobox", { name: "Country" });
const listbox = () => page.getByRole("listbox");
const option = (name: string) => page.getByRole("option", { name });
const toggle = () => page.getByRole("button", { name: /Show suggestions/ });

// The element React Aria animates: the popover around the list.
function popover(): Element {
  const found = listbox().element().parentElement;
  if (found == null) throw new Error("no popover around the list");
  return found;
}

function box(): Element {
  const found = input().element().parentElement;
  if (found === null) throw new Error("no box around the input");
  return found;
}

// Keys act on the list as it is now; on a slow machine the next key can arrive before the
// list opens or moves focus, so each step waits for the state the next one needs.
async function focusedOption(name: string) {
  await expect.element(option(name)).toHaveAttribute("data-focused", "true");
}

async function open() {
  await toggle().click();
  await expect.element(listbox()).toBeVisible();
}

describe("Combobox", () => {
  test("text that matches nothing says so instead of closing the list", async () => {
    await render(<CountryBox />);

    await userEvent.type(input(), "zzz");

    // Expanded is the settled state; a closing list would still be in the page while it fades.
    await expect.element(input()).toHaveAttribute("aria-expanded", "true");
    await expect.element(listbox()).toHaveTextContent("No matches");
  });

  test("an invalid value shows the error inside a live region that was there before it", async () => {
    const { container } = await render(
      <CountryBox
        validationBehavior="aria"
        validate={({ value }) => (value === "kg" ? "We can't ship there yet" : null)}
      />,
    );
    const region = container.querySelector('[aria-live="polite"]');
    expect(region).not.toBeNull();

    await userEvent.type(input(), "kyr");
    await expect.element(option("Uzbekistan")).not.toBeInTheDocument();
    await userEvent.keyboard("{ArrowDown}");
    await focusedOption("Kyrgyzstan");
    await userEvent.keyboard("{Enter}");

    await expect.poll(() => region?.textContent).toContain("We can't ship there yet");
    await expect.element(input()).toHaveAccessibleDescription(/We can't ship there yet/);
  });

  test("the list is at least as wide as the box", async () => {
    await render(<CountryBox />);
    await open();

    const width = (element: Element) => element.getBoundingClientRect().width;
    expect(width(popover())).toBeGreaterThanOrEqual(width(box()) - 1);
  });

  // A list that pokes past the screen edge scrolls the page sideways when the keyboard moves
  // to an option, and React Aria closes the list on that scroll.
  test("a list under a full-width box stays inside the screen", async () => {
    await render(<CountryBox />);
    await open();

    const { left, right } = popover().getBoundingClientRect();
    expect(left).toBeGreaterThanOrEqual(0);
    expect(right).toBeLessThanOrEqual(document.documentElement.clientWidth);
  });

  test("the focus ring goes around the whole box while the input has focus", async () => {
    await render(<CountryBox />);

    await input().click();

    await expect.poll(() => getComputedStyle(box()).outlineStyle).toBe("solid");
    expect(box().contains(toggle().element())).toBe(true);
  });

  test.each(["light", "dark"] as const)(
    "the box outline and every option keep their contrast in %s mode",
    async (theme) => {
      setTheme(theme);
      await render(<CountryBox />);

      expect(contrast(getComputedStyle(box()).borderTopColor, pageColor())).toBeGreaterThanOrEqual(
        3,
      );

      await open();
      const surface = getComputedStyle(popover()).backgroundColor;
      for (const name of ["Uzbekistan", "Kazakhstan"]) {
        const { color } = getComputedStyle(option(name).element());
        expect(contrast(color, surface)).toBeGreaterThanOrEqual(4.5);
      }
    },
  );

  test("the focused option still stands out in forced colors (Windows High Contrast)", async () => {
    await emulateMedia("forced-colors", "active");
    await render(<CountryBox />);

    await open();
    await userEvent.keyboard("{ArrowDown}");
    await focusedOption("Uzbekistan");

    const fill = (name: string) => getComputedStyle(option(name).element()).backgroundColor;
    expect(sameColor(fill("Uzbekistan"), fill("Kazakhstan"))).toBe(false);
  });

  test("on touch screens the text is 16px and the button is 44px", async () => {
    await render(<CountryBox />);
    await emulateTouch();

    expect(getComputedStyle(input().element()).fontSize).toBe("16px");
    const size = toggle().element().getBoundingClientRect();
    expect(size.width).toBeGreaterThanOrEqual(44);
    expect(size.height).toBeGreaterThanOrEqual(44);
  });

  test("it closes faster than it opens", async () => {
    const started = startedAnimations();
    await render(<CountryBox />);
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
    await emulateMedia("prefers-reduced-motion", "reduce");
    await render(<CountryBox />);

    await open();

    expect(getComputedStyle(popover()).animationDuration).toBe("0s");
  });
});
