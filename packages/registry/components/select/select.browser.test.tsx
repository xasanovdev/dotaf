import { describe, expect, test, vi } from "vitest";
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
import { emulateMedia, pageColor, setTheme } from "../../test/browser/test-utils";

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
  test("the label names the trigger, which shows the placeholder until a choice", async () => {
    await render(<CountrySelect />);

    await expect.element(trigger()).toHaveAccessibleName(/Country/);
    await expect.element(trigger()).toHaveTextContent("Pick a country");
  });

  test("the keyboard opens it, moves through options and picks one", async () => {
    const onChange = vi.fn();
    await render(<CountrySelect onChange={onChange} />);

    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(listbox()).toBeVisible();
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Enter}");

    expect(onChange).toHaveBeenCalledWith("kz");
    await expect.element(listbox()).not.toBeInTheDocument();
    await expect.element(trigger()).toHaveTextContent("Kazakhstan");
    await expect.element(trigger()).toHaveFocus();
  });

  test("Escape closes it without changing the value", async () => {
    const onChange = vi.fn();
    await render(<CountrySelect defaultValue="uz" onChange={onChange} />);
    await open();

    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Escape}");

    await expect.element(listbox()).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
    await expect.element(trigger()).toHaveTextContent("Uzbekistan");
  });

  test("the selected option is marked for assistive technology; a disabled one can't be picked", async () => {
    await render(<CountrySelect defaultValue="uz" />);
    await open();

    await expect.element(option("Uzbekistan")).toHaveAttribute("aria-selected", "true");
    await expect.element(option("Kyrgyzstan")).toHaveAttribute("aria-disabled", "true");
  });

  test("it submits the chosen value with its form", async () => {
    let submitted: FormData | undefined;
    await render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitted = new FormData(event.currentTarget);
        }}
      >
        <CountrySelect name="country" defaultValue="kz" />
        <button type="submit">Send</button>
      </form>,
    );

    await page.getByRole("button", { name: "Send" }).click();

    expect(submitted?.get("country")).toBe("kz");
  });

  test("the error shows while the value is invalid", async () => {
    await render(<CountrySelect isInvalid />);

    await expect.element(page.getByText("Pick a country to continue.")).toBeVisible();
  });

  test("the list is at least as wide as the trigger", async () => {
    await render(<CountrySelect />);
    await open();

    const width = (element: Element) => element.getBoundingClientRect().width;
    expect(width(popover())).toBeGreaterThanOrEqual(width(trigger().element()) - 1);
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
