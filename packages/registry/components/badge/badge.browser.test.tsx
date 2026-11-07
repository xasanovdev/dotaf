import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { Badge, type BadgeProps } from "./badge";

import "virtual:dotaf.css";

import { contrast, sameColor } from "../../test/browser/contrast";
import { emulateMedia, pageColor, setTheme } from "../../test/browser/test-utils";

const variants = [
  "neutral",
  "primary",
  "success",
  "warning",
  "danger",
] as const satisfies readonly NonNullable<BadgeProps["variant"]>[];

describe("Badge", () => {
  test("the label is plain text in the page, read in place", async () => {
    await render(
      <p>
        Status: <Badge variant="success">Active</Badge>
      </p>,
    );

    await expect.element(page.getByText("Status: Active")).toBeVisible();
  });

  test.each(["light", "dark"] as const)(
    "every variant keeps its text at 4.5:1 on its own fill in %s mode",
    async (theme) => {
      setTheme(theme);
      await render(
        <>
          {variants.map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant}
            </Badge>
          ))}
        </>,
      );

      for (const variant of variants) {
        const style = getComputedStyle(page.getByText(variant, { exact: true }).element());
        expect(contrast(style.color, style.backgroundColor), variant).toBeGreaterThanOrEqual(4.5);
      }
    },
  );

  test("the variants differ in color, not only in their words", async () => {
    await render(
      <>
        {variants.map((variant) => (
          <Badge key={variant} variant={variant}>
            {variant}
          </Badge>
        ))}
      </>,
    );

    const fills = variants.map(
      (variant) =>
        getComputedStyle(page.getByText(variant, { exact: true }).element()).backgroundColor,
    );
    for (const [index, fill] of fills.entries()) {
      for (const other of fills.slice(index + 1)) {
        expect(sameColor(fill, other)).toBe(false);
      }
    }
    expect(sameColor(fills[0] ?? "", pageColor())).toBe(false);
  });

  // High Contrast mode drops the fill; a border keeps the badge's shape.
  test("the badge keeps an outline in forced colors (Windows High Contrast)", async () => {
    await emulateMedia("forced-colors", "active");
    await render(<Badge>Draft</Badge>);

    const style = getComputedStyle(page.getByText("Draft").element());
    expect(style.borderTopStyle).toBe("solid");
    expect(style.borderTopWidth).toBe("1px");
  });
});
