import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";

import { Button } from "../button/button";
import { Menu, MenuItem, MenuSeparator, MenuTrigger, type MenuProps } from "./menu";

import "virtual:dotaf.css";

import { contrast, sameColor } from "../../test/browser/contrast";
import { emulateMedia, setTheme, startedAnimations } from "../../test/browser/test-utils";

function ActionsMenu(props: Omit<MenuProps, "children">) {
  return (
    <MenuTrigger>
      <Button variant="secondary">Actions</Button>
      <Menu {...props}>
        <MenuItem id="rename">Rename</MenuItem>
        <MenuItem id="duplicate">Duplicate</MenuItem>
        <MenuItem id="archive" isDisabled>
          Archive
        </MenuItem>
        <MenuSeparator />
        <MenuItem id="delete" variant="danger">
          Delete
        </MenuItem>
      </Menu>
    </MenuTrigger>
  );
}

const trigger = () => page.getByRole("button", { name: "Actions" });
const menu = () => page.getByRole("menu");
const item = (name: string) => page.getByRole("menuitem", { name });

async function open() {
  await trigger().click();
  await expect.element(menu()).toBeVisible();
}

// The element React Aria animates: the popover around the menu.
function popover(): Element {
  const found = menu().element().parentElement;
  if (found == null) throw new Error("no popover around the menu");
  return found;
}

describe("Menu", () => {
  test("the keyboard opens it on the first item, moves down and runs the action", async () => {
    const onAction = vi.fn();
    await render(<ActionsMenu onAction={onAction} />);

    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await expect.element(item("Rename")).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Enter}");

    expect(onAction).toHaveBeenCalledWith("duplicate", undefined);
    await expect.element(menu()).not.toBeInTheDocument();
    await expect.element(trigger()).toHaveFocus();
  });

  test("arrow keys skip disabled items", async () => {
    await render(<ActionsMenu />);
    await open();

    await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}");

    await expect.element(item("Delete")).toHaveFocus();
    await expect.element(item("Archive")).toHaveAttribute("aria-disabled", "true");
  });

  test("Escape closes it and focus returns to the trigger", async () => {
    await render(<ActionsMenu />);
    await open();

    await userEvent.keyboard("{Escape}");

    await expect.element(menu()).not.toBeInTheDocument();
    await expect.element(trigger()).toHaveFocus();
  });

  test("the separator divides groups for assistive technology", async () => {
    await render(<ActionsMenu />);
    await open();

    await expect.element(page.getByRole("separator")).toBeInTheDocument();
  });

  test.each(["light", "dark"] as const)(
    "every item keeps 4.5:1 text contrast, at rest and focused, in %s mode",
    async (theme) => {
      setTheme(theme);
      await render(<ActionsMenu />);
      await open();

      const surface = getComputedStyle(popover()).backgroundColor;
      for (const name of ["Rename", "Delete"]) {
        expect(
          contrast(getComputedStyle(item(name).element()).color, surface),
        ).toBeGreaterThanOrEqual(4.5);
      }

      await userEvent.keyboard("{End}");
      await expect.element(item("Delete")).toHaveFocus();
      const focused = getComputedStyle(item("Delete").element());
      expect(contrast(focused.color, focused.backgroundColor)).toBeGreaterThanOrEqual(4.5);
    },
  );

  test("a danger item reads in the danger color", async () => {
    await render(<ActionsMenu />);
    await open();

    const color = (name: string) => getComputedStyle(item(name).element()).color;
    expect(sameColor(color("Delete"), color("Rename"))).toBe(false);
  });

  test("the focused item still stands out in forced colors (Windows High Contrast)", async () => {
    await emulateMedia("forced-colors", "active");
    await render(<ActionsMenu />);
    // Opening from the keyboard focuses the first item; a click focuses the menu itself.
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await expect.element(item("Rename")).toHaveFocus();

    const fill = (name: string) => getComputedStyle(item(name).element()).backgroundColor;
    expect(sameColor(fill("Rename"), fill("Duplicate"))).toBe(false);
  });

  test("it closes faster than it opens", async () => {
    const started = startedAnimations();
    await render(<ActionsMenu />);
    await open();
    const element = popover();
    await expect.poll(() => element.hasAttribute("data-entering")).toBe(false);

    await userEvent.keyboard("{Escape}");
    await expect.element(menu()).not.toBeInTheDocument();

    const [enter, exit] = started.filter((a) => a.target === element).map((a) => a.duration);
    expect(exit).toBeLessThan(enter ?? 0);
  });

  // The duration tokens carry reduced motion, so the popover needs no media query of its own.
  test("reduced motion stops the open and close animation", async () => {
    await render(<ActionsMenu />);
    await open();
    expect(getComputedStyle(popover()).animationDuration).not.toBe("0s");
    await userEvent.keyboard("{Escape}");
    await expect.element(menu()).not.toBeInTheDocument();

    await emulateMedia("prefers-reduced-motion", "reduce");
    await open();
    expect(getComputedStyle(popover()).animationDuration).toBe("0s");
  });
});
