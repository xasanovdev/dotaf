import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";

import { Button } from "../button";
import { Tooltip, TooltipTrigger, type TooltipProps } from "./tooltip";

import "virtual:dotaf.css";

import { contrast } from "../../test/browser/contrast";
import { emulateMedia, setTheme } from "../../test/browser/test-utils";

function SaveTooltip(props: Omit<TooltipProps, "children">) {
  return (
    <TooltipTrigger delay={0}>
      <Button>Save</Button>
      <Tooltip {...props}>Saves a copy to your drafts</Tooltip>
    </TooltipTrigger>
  );
}

const trigger = () => page.getByRole("button", { name: "Save" });
const tooltip = () => page.getByRole("tooltip");

async function show() {
  await userEvent.tab();
  await expect.element(tooltip()).toBeVisible();
}

describe("Tooltip", () => {
  // First in the file: once any tooltip has shown, React Aria shows the next one at once, which
  // would hide the delay. Each test file gets a fresh page.
  test("by default, hovering shows it within a second, not React Aria's 1.5", async () => {
    await render(
      <TooltipTrigger>
        <Button>Save</Button>
        <Tooltip>Saves a copy to your drafts</Tooltip>
      </TooltipTrigger>,
    );
    await userEvent.click(document.body, { position: { x: 1, y: 1 } });

    await trigger().hover();

    await expect.element(tooltip(), { timeout: 1000 }).toBeVisible();
  });

  test.each(["light", "dark"] as const)(
    "its text keeps 4.5:1 contrast in %s mode",
    async (theme) => {
      setTheme(theme);
      await render(<SaveTooltip />);
      await show();

      const { color, backgroundColor } = getComputedStyle(tooltip().element());
      expect(contrast(color, backgroundColor)).toBeGreaterThanOrEqual(4.5);
    },
  );

  test("it keeps an outline in forced colors (Windows High Contrast), where fills drop", async () => {
    await emulateMedia("forced-colors", "active");
    await render(<SaveTooltip />);
    await show();

    const style = getComputedStyle(tooltip().element());
    expect(style.borderTopStyle).toBe("solid");
    expect(style.borderTopWidth).not.toBe("0px");
  });

  // The duration tokens carry reduced motion, so the tooltip needs no media query of its own.
  test("reduced motion stops the show and hide animation", async () => {
    await render(<SaveTooltip />);
    await show();
    expect(getComputedStyle(tooltip().element()).animationDuration).not.toBe("0s");

    await emulateMedia("prefers-reduced-motion", "reduce");

    await expect.poll(() => getComputedStyle(tooltip().element()).animationDuration).toBe("0s");
  });
});
