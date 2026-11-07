import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { Separator } from "./separator";

import "virtual:dotaf.css";

import { emulateMedia } from "../../test/browser/test-utils";

describe("Separator", () => {
  test("a horizontal separator is announced and spans the width of its container", async () => {
    await render(
      <div style={{ width: 300 }}>
        <p>Above</p>
        <Separator />
        <p>Below</p>
      </div>,
    );

    const box = page.getByRole("separator").element().getBoundingClientRect();
    expect(box.width).toBe(300);
    expect(box.height).toBe(1);
  });

  test("a vertical separator fills the height of the row it sits in", async () => {
    await render(
      <div style={{ display: "flex", height: 40 }}>
        <span>Left</span>
        <Separator orientation="vertical" />
        <span>Right</span>
      </div>,
    );

    const line = page.getByRole("separator");
    await expect.element(line).toHaveAttribute("aria-orientation", "vertical");
    const box = line.element().getBoundingClientRect();
    expect(box.height).toBe(40);
    expect(box.width).toBe(1);
  });

  // High Contrast mode drops background colors, so the line is drawn as a border.
  test("the line still shows in forced colors (Windows High Contrast)", async () => {
    await emulateMedia("forced-colors", "active");
    await render(<Separator />);

    const style = getComputedStyle(page.getByRole("separator").element());
    expect(style.borderTopStyle).toBe("solid");
    expect(style.borderTopWidth).toBe("1px");
  });
});
