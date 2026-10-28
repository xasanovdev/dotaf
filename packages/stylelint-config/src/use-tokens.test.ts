import stylelint from "stylelint";
import { describe, expect, test } from "vitest";
import config from "./index.js";

// Lints the way a user's project does: the package's default config, through stylelint.
async function warnings(css: string): Promise<string[]> {
  const { results } = await stylelint.lint({ code: css, config });
  return results.flatMap((result) => result.warnings.map((warning) => warning.text));
}

describe("dotaf/use-tokens", () => {
  test("raw spacing points to the nearest space step", async () => {
    expect(await warnings(".a { padding: 16px 0.5rem; margin-top: 13px; gap: 5%; }")).toEqual([
      "Use var(--dotaf-space-4) instead of 16px (dotaf/use-tokens)",
      "Use var(--dotaf-space-2) instead of 0.5rem (dotaf/use-tokens)",
      "Use var(--dotaf-space-3) instead of 13px (dotaf/use-tokens)",
      "Use a spacing token (var(--dotaf-space-1) to var(--dotaf-space-16)) instead of 5% (dotaf/use-tokens)",
    ]);
  });

  test("raw colors point to the tokens meant for that property", async () => {
    const css = `.a {
      color: #6b7280;
      background: white url(x.png) no-repeat center;
      border: 1px solid #e5e7eb;
      outline-color: rgb(0 0 0);
    }`;
    expect(await warnings(css)).toEqual([
      "Use var(--dotaf-color-fg) or var(--dotaf-color-muted-fg) instead of #6b7280 (dotaf/use-tokens)",
      "Use var(--dotaf-color-bg), var(--dotaf-color-muted) or var(--dotaf-color-primary) instead of white (dotaf/use-tokens)",
      "Use var(--dotaf-color-border) instead of #e5e7eb (dotaf/use-tokens)",
      "Use var(--dotaf-color-primary) instead of rgb(0 0 0) (dotaf/use-tokens)",
    ]);
  });

  test("colors from tokens, currentColor, transparent and border widths pass", async () => {
    const css = `.a {
      color: currentColor;
      background-color: color-mix(in oklch, var(--dotaf-color-primary) 20%, transparent);
      border: 1px solid var(--dotaf-color-border);
      outline: 2px solid var(--dotaf-color-primary);
      border-top: none;
    }`;
    expect(await warnings(css)).toEqual([]);
  });

  test("raw radius and type point to their scale", async () => {
    const css = `.a {
      border-radius: 8px;
      border-top-left-radius: 50%;
      font-size: 14px;
      font-family: "Inter Var", sans-serif;
    }`;
    expect(await warnings(css)).toEqual([
      "Use var(--dotaf-radius-md) instead of 8px (dotaf/use-tokens)",
      "Use var(--dotaf-radius-full) instead of 50% (dotaf/use-tokens)",
      "Use var(--dotaf-text-sm) instead of 14px (dotaf/use-tokens)",
      'Use var(--dotaf-font-sans) or var(--dotaf-font-mono) instead of "Inter Var", sans-serif (dotaf/use-tokens)',
    ]);
  });

  test("radius and type from tokens pass", async () => {
    const css = `.a {
      border-radius: var(--dotaf-radius-md) 0;
      font-size: var(--dotaf-text-sm);
      font-family: var(--dotaf-font-mono);
    }`;
    expect(await warnings(css)).toEqual([]);
  });

  test("a blurred shadow is an elevation and must be a shadow token", async () => {
    const css = `.a { box-shadow: 0 1px 2px rgb(0 0 0 / 0.1); }
      .b { box-shadow: 0 4px 8px var(--dotaf-color-fg); }`;
    expect(await warnings(css)).toEqual([
      "Use var(--dotaf-shadow-sm), var(--dotaf-shadow-md) or var(--dotaf-shadow-lg) instead of 0 1px 2px rgb(0 0 0 / 0.1) (dotaf/use-tokens)",
      "Use var(--dotaf-shadow-sm), var(--dotaf-shadow-md) or var(--dotaf-shadow-lg) instead of 0 4px 8px var(--dotaf-color-fg) (dotaf/use-tokens)",
    ]);
  });

  test("an unblurred shadow is a ring: widths are free, the color must be a token", async () => {
    const css = `.a { box-shadow: 0 0 0 2px var(--dotaf-color-primary); }
      .b { box-shadow: inset 0 1px 0 var(--dotaf-color-border), var(--dotaf-shadow-sm); }
      .c { box-shadow: 0 0 0 2px #00f; }`;
    expect(await warnings(css)).toEqual([
      "Use var(--dotaf-color-border) or var(--dotaf-color-primary) instead of #00f (dotaf/use-tokens)",
    ]);
  });

  test("shadows from tokens and none pass", async () => {
    expect(await warnings(".a { box-shadow: var(--dotaf-shadow-md); text-shadow: none; }")).toEqual(
      [],
    );
  });

  test("a non-dotaf variable is rejected like a raw value", async () => {
    expect(await warnings(".a { color: var(--header-fg); }")).toEqual([
      "Use var(--dotaf-color-fg) or var(--dotaf-color-muted-fg) instead of var(--header-fg) (dotaf/use-tokens)",
    ]);
  });

  test("custom property declarations are not checked, since that is where tokens get aliased", async () => {
    expect(await warnings(":root { --header-fg: #333; --gutter: 24px; }")).toEqual([]);
  });

  test("the font shorthand is checked for size and family", async () => {
    const css = `.a { font: italic 700 14px/1.5 "Helvetica", sans-serif; }
      .b { font: 700 var(--dotaf-text-sm)/1.5 var(--dotaf-font-sans); }
      .c { font: inherit; }`;
    expect(await warnings(css)).toEqual([
      'Use var(--dotaf-text-*) and var(--dotaf-font-sans) or var(--dotaf-font-mono) instead of italic 700 14px/1.5 "Helvetica", sans-serif (dotaf/use-tokens)',
    ]);
  });

  test("colors inside gradients and the text-decoration shorthand are checked", async () => {
    const css = `.a {
      background-image: linear-gradient(90deg, #fff, var(--dotaf-color-bg));
      text-decoration: underline red;
    }`;
    expect(await warnings(css)).toEqual([
      "Use var(--dotaf-color-bg), var(--dotaf-color-muted) or var(--dotaf-color-primary) instead of #fff (dotaf/use-tokens)",
      "Use var(--dotaf-color-fg) or var(--dotaf-color-muted-fg) instead of red (dotaf/use-tokens)",
    ]);
  });

  test("negative and uppercase lengths point to the right step", async () => {
    expect(await warnings(".a { margin: -8px 0 0 16PX; }")).toEqual([
      "Use calc(-1 * var(--dotaf-space-2)) instead of -8px (dotaf/use-tokens)",
      "Use var(--dotaf-space-4) instead of 16PX (dotaf/use-tokens)",
    ]);
  });

  test("spacing from tokens, zero, auto and normal passes", async () => {
    expect(
      await warnings(
        ".a { padding: var(--dotaf-space-2) 0; margin: 0 auto; gap: calc(var(--dotaf-space-1) * 2); row-gap: normal; }",
      ),
    ).toEqual([]);
  });
});
