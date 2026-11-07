import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";

import { Button } from "../button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  type DialogProps,
} from "./dialog";

import "virtual:dotaf.css";

import { contrast, sameColor } from "../../test/browser/contrast";
import {
  emulateMedia,
  setTheme,
  startedAnimations,
  tokenColor,
} from "../../test/browser/test-utils";

function DeleteDialog(props: Omit<DialogProps, "children">) {
  return (
    <DialogTrigger>
      <Button>Delete project</Button>
      <Dialog role="alertdialog" {...props}>
        <DialogTitle>Delete project?</DialogTitle>
        <DialogDescription>This removes every file in it.</DialogDescription>
        <DialogFooter>
          <Button slot="close" variant="secondary">
            Cancel
          </Button>
          <Button variant="danger">Delete</Button>
        </DialogFooter>
      </Dialog>
    </DialogTrigger>
  );
}

const trigger = () => page.getByRole("button", { name: "Delete project" });
const dialog = () => page.getByRole("alertdialog");

async function open() {
  await trigger().click();
  await expect.element(dialog()).toBeVisible();
}

// The element React Aria animates: the full-screen layer that carries the scrim.
function overlay(): Element {
  const found = dialog().element().parentElement?.parentElement;
  if (found == null) throw new Error("no overlay around the dialog");
  return found;
}

describe("Dialog", () => {
  test('a button with slot="close" closes it', async () => {
    await render(<DeleteDialog />);
    await open();

    await page.getByRole("button", { name: "Cancel" }).click();

    await expect.element(dialog()).not.toBeInTheDocument();
  });

  test("DialogClose is a button named Close that closes it", async () => {
    await render(
      <DialogTrigger>
        <Button>Rename project</Button>
        <Dialog>
          <DialogClose />
          <DialogTitle>Rename project</DialogTitle>
        </Dialog>
      </DialogTrigger>,
    );
    await page.getByRole("button", { name: "Rename project" }).click();

    await page.getByRole("button", { name: "Close" }).click();

    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
  });

  test("DialogClose takes a translated name", async () => {
    await render(
      <Dialog isOpen aria-label="Einstellungen">
        <DialogClose aria-label="Schließen" />
      </Dialog>,
    );

    await expect.element(page.getByRole("button", { name: "Schließen" })).toBeVisible();
  });

  test("the scrim token dims the page behind it", async () => {
    await render(<DeleteDialog />);
    await open();

    const scrim = getComputedStyle(overlay()).backgroundColor;
    expect(sameColor(scrim, tokenColor("--dotaf-color-scrim"))).toBe(true);
    expect(sameColor(scrim, "transparent")).toBe(false);
  });

  test.each(["light", "dark"] as const)(
    "title and description keep 4.5:1 contrast on the panel in %s mode",
    async (theme) => {
      setTheme(theme);
      await render(<DeleteDialog />);
      await open();

      const panel = getComputedStyle(dialog().element()).backgroundColor;
      for (const text of ["Delete project?", "This removes every file in it."]) {
        const { color } = getComputedStyle(page.getByText(text).element());
        expect(contrast(color, panel)).toBeGreaterThanOrEqual(4.5);
      }
    },
  );

  test("it closes faster than it opens", async () => {
    const started = startedAnimations();
    await render(<DeleteDialog />);
    await open();
    const element = overlay();
    await expect.poll(() => element.hasAttribute("data-entering")).toBe(false);

    await userEvent.keyboard("{Escape}");
    await expect.element(dialog()).not.toBeInTheDocument();

    const [enter, exit] = started.filter((a) => a.target === element).map((a) => a.duration);
    expect(exit).toBeLessThan(enter ?? 0);
  });

  // The duration tokens carry reduced motion, so the dialog needs no media query of its own.
  test("reduced motion stops the enter and exit animation", async () => {
    await render(<DeleteDialog />);
    await open();
    expect(getComputedStyle(overlay()).animationDuration).not.toBe("0s");
    await userEvent.keyboard("{Escape}");
    await expect.element(dialog()).not.toBeInTheDocument();

    await emulateMedia("prefers-reduced-motion", "reduce");
    await open();
    expect(getComputedStyle(overlay()).animationDuration).toBe("0s");
  });
});
