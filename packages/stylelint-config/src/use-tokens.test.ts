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
      'Use var(--dotaf-font-weight-*), var(--dotaf-text-*) and var(--dotaf-font-sans) or var(--dotaf-font-mono) instead of italic 700 14px/1.5 "Helvetica", sans-serif (dotaf/use-tokens)',
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

  test("raw font weights point to the nearest weight token", async () => {
    const css = `.a { font-weight: 500; }
      .b { font-weight: bold; }
      .c { font-weight: var(--dotaf-font-weight-medium); }`;
    expect(await warnings(css)).toEqual([
      "Use var(--dotaf-font-weight-medium) instead of 500 (dotaf/use-tokens)",
      "Use var(--dotaf-font-weight-semibold) instead of bold (dotaf/use-tokens)",
    ]);
  });

  test("raw transition timing points to the motion tokens; property names stay free", async () => {
    const css = `.a { transition: background-color 150ms ease-out, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      .b { transition: opacity var(--dotaf-duration-fast) var(--dotaf-ease-out); transition-delay: 0s; }`;
    expect(await warnings(css)).toEqual([
      "Use var(--dotaf-duration-fast) instead of 150ms (dotaf/use-tokens)",
      "Use var(--dotaf-ease-out) instead of ease-out (dotaf/use-tokens)",
      "Use var(--dotaf-duration-normal) instead of 0.3s (dotaf/use-tokens)",
      "Use var(--dotaf-ease-out) instead of cubic-bezier(0.4, 0, 0.2, 1) (dotaf/use-tokens)",
    ]);
  });

  test("animations check their duration but may keep their own easing, e.g. a linear spinner", async () => {
    expect(await warnings(".a { animation: pulse 150ms linear infinite; }")).toEqual([
      "Use var(--dotaf-duration-fast) instead of 150ms (dotaf/use-tokens)",
    ]);
  });

  test("a focus rule draws its outline with the focus ring tokens", async () => {
    const css = `.a:focus-visible { outline: 2px solid red; outline-offset: 3px; }
      .b[data-focus-visible] { outline: var(--dotaf-focus-ring); outline-offset: var(--dotaf-focus-ring-offset); }
      .c[data-focused] { outline: none; }
      .d { outline: none; }`;
    expect(await warnings(css)).toEqual([
      "Use var(--dotaf-focus-ring) instead of 2px solid red (dotaf/use-tokens)",
      "Use var(--dotaf-focus-ring-offset) instead of 3px (dotaf/use-tokens)",
    ]);
  });

  test("transition delays stay free; only the duration of each layer is a token", async () => {
    const css = `.a { transition: transform 300ms 50ms, opacity 120ms 0s; transition-delay: 80ms; }`;
    expect(await warnings(css)).toEqual([
      "Use var(--dotaf-duration-normal) instead of 300ms (dotaf/use-tokens)",
      "Use var(--dotaf-duration-fast) instead of 120ms (dotaf/use-tokens)",
    ]);
  });

  test("a duration far beyond the scale gets no misleading nearest step", async () => {
    expect(await warnings(".a { animation: spin 1s linear infinite; }")).toEqual([
      "Use a duration token (var(--dotaf-duration-fast) to var(--dotaf-duration-normal)) instead of 1s (dotaf/use-tokens)",
    ]);
  });

  test("a non-dotaf variable in a transition gets both motion tokens suggested", async () => {
    expect(await warnings(".a { transition: opacity var(--my-duration); }")).toEqual([
      "Use var(--dotaf-duration-fast), var(--dotaf-duration-normal) or var(--dotaf-ease-out) instead of var(--my-duration) (dotaf/use-tokens)",
    ]);
  });

  test("focus rules allow removing the outline and check its longhands and focus-within", async () => {
    const css = `.a:focus-visible { outline: 0; }
      .b:focus-visible { outline-width: 4px; outline-style: dashed; }
      .c[data-focus-within] { outline: 2px solid red; }`;
    expect(await warnings(css)).toEqual([
      "Use var(--dotaf-focus-ring) instead of 4px (dotaf/use-tokens)",
      "Use var(--dotaf-focus-ring) instead of dashed (dotaf/use-tokens)",
      "Use var(--dotaf-focus-ring) instead of 2px solid red (dotaf/use-tokens)",
    ]);
  });

  test("a rule is a focus rule only when every selector in it is one", async () => {
    const css = `.a:not(:focus-visible) { outline: 1px solid var(--dotaf-color-border); }
      .b, .c:focus-visible { outline: 1px solid var(--dotaf-color-border); }`;
    expect(await warnings(css)).toEqual([]);
  });

  test("the font shorthand names the weight token too", async () => {
    expect(await warnings(".a { font: 600 1rem/1.2 var(--dotaf-font-sans); }")).toEqual([
      "Use var(--dotaf-font-weight-*), var(--dotaf-text-*) and var(--dotaf-font-sans) or var(--dotaf-font-mono) instead of 600 1rem/1.2 var(--dotaf-font-sans) (dotaf/use-tokens)",
    ]);
  });

  test("a value repeated in one declaration is reported at each of its own columns", async () => {
    const { results } = await stylelint.lint({ code: ".a { margin: 16px 0 16px 0; }", config });
    const columns = results.flatMap((result) => result.warnings.map((warning) => warning.column));

    expect(columns).toEqual([14, 21]);
  });

  test("spacing from tokens, zero, auto and normal passes", async () => {
    expect(
      await warnings(
        ".a { padding: var(--dotaf-space-2) 0; margin: 0 auto; gap: calc(var(--dotaf-space-1) * 2); row-gap: normal; }",
      ),
    ).toEqual([]);
  });
});
