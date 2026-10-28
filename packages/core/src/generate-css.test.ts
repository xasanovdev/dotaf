import { suggestedTokens } from "@dotaf/stylelint-config";
import postcss from "postcss";
import { describe, expect, test } from "vitest";

import { generateCss, parseConfig, type DotafConfig } from "./index.js";

const lightSelector = ':root, [data-theme="light"]';

// Parsing with postcss also proves the output is syntactically valid CSS.
function declarationsOf(css: string, selector: string, media?: string): Record<string, string> {
  const declarations: Record<string, string> = {};
  postcss.parse(css).walkRules((rule) => {
    const parent = rule.parent;
    const inPlace =
      media === undefined
        ? parent?.type === "root"
        : parent?.type === "atrule" && "params" in parent && parent.params === media;
    if (inPlace && rule.selectors.join(", ") === selector) {
      rule.walkDecls((declaration) => {
        declarations[declaration.prop] = declaration.value;
      });
    }
  });
  return declarations;
}

/** Theme-independent tokens generated for a dotaf.json. */
function rootTokens(input: DotafConfig): Record<string, string> {
  return declarationsOf(generateCss(parseConfig(input)), ":root");
}

describe("generateCss", () => {
  test("brand colors become light tokens on the root", () => {
    const css = generateCss(parseConfig({ colors: { primary: "#16a34a" } }));

    expect(declarationsOf(css, lightSelector)).toMatchObject({
      "--dotaf-color-primary": "#16a34a",
      "--dotaf-color-bg": "#ffffff",
      "--dotaf-color-fg": "#0a0a0a",
    });
  });

  test("the dark palette applies by attribute and by system preference", () => {
    const css = generateCss(parseConfig({ dark: { background: "#111111" } }));
    const dark = { "color-scheme": "dark", "--dotaf-color-bg": "#111111" };

    expect(declarationsOf(css, '[data-theme="dark"]')).toMatchObject(dark);
    expect(
      declarationsOf(css, ':root:not([data-theme="light"])', "(prefers-color-scheme: dark)"),
    ).toMatchObject(dark);
  });

  test("dark accents the user left unset are lifted to stay readable; set ones are kept", () => {
    const css = generateCss(
      parseConfig({ colors: { primary: "#1d4ed8" }, dark: { danger: "#ff6b6b" } }),
    );

    expect(declarationsOf(css, '[data-theme="dark"]')).toMatchObject({
      "--dotaf-color-primary": "oklch(from #1d4ed8 max(l, 0.7) c h)",
      "--dotaf-color-danger": "#ff6b6b",
    });
  });

  test("derived colors and the focus ring follow the active theme wherever one can be set", () => {
    const derived = declarationsOf(generateCss(parseConfig({})), ":root, [data-theme]");
    const names = [
      "--dotaf-color-muted",
      "--dotaf-color-muted-fg",
      "--dotaf-color-border",
      "--dotaf-color-primary-hover",
      "--dotaf-color-on-primary",
      "--dotaf-color-danger-hover",
      "--dotaf-color-on-danger",
      "--dotaf-color-control-border",
      "--dotaf-focus-ring",
    ];

    const fixed = names.filter((name) => !derived[name]?.includes("var(--dotaf-color-"));
    expect(fixed).toEqual([]);
  });

  test("the radius setting picks the corner scale", () => {
    expect(rootTokens({ radius: "none" })).toMatchObject({
      "--dotaf-radius-sm": "0",
      "--dotaf-radius-md": "0",
      "--dotaf-radius-lg": "0",
      "--dotaf-radius-full": "9999px",
    });
    expect(rootTokens({ radius: "lg" })).toMatchObject({
      "--dotaf-radius-sm": "0.5rem",
      "--dotaf-radius-md": "0.75rem",
      "--dotaf-radius-lg": "1rem",
    });
  });

  test("density scales every spacing step through one unit", () => {
    expect(rootTokens({ density: "compact" })).toMatchObject({
      "--dotaf-space-unit": "0.2rem",
      "--dotaf-space-1": "var(--dotaf-space-unit)",
      "--dotaf-space-4": "calc(var(--dotaf-space-unit) * 4)",
      "--dotaf-space-16": "calc(var(--dotaf-space-unit) * 16)",
    });
    expect(rootTokens({ density: "spacious" })).toMatchObject({ "--dotaf-space-unit": "0.3rem" });
  });

  test("font stacks come from the config as written", () => {
    expect(rootTokens({ font: { sans: '"M+ 1p", sans-serif' } })).toMatchObject({
      "--dotaf-font-sans": '"M+ 1p", sans-serif',
      "--dotaf-font-mono": "ui-monospace, monospace",
    });
  });

  test("every brand gets the same type scale and shadows", () => {
    const scales = rootTokens({});

    expect(scales).toMatchObject({
      "--dotaf-text-xs": "0.75rem",
      "--dotaf-text-sm": "0.875rem",
      "--dotaf-text-base": "1rem",
      "--dotaf-text-lg": "1.125rem",
      "--dotaf-text-xl": "1.25rem",
      "--dotaf-text-2xl": "1.5rem",
    });
    for (const size of ["sm", "md", "lg"]) {
      expect(scales[`--dotaf-shadow-${size}`]).toMatch(/^0 \d+px/);
    }
  });

  test("weights, motion, disabled opacity and the focus ring offset are fixed root tokens", () => {
    expect(rootTokens({})).toMatchObject({
      "--dotaf-font-weight-normal": "400",
      "--dotaf-font-weight-medium": "500",
      "--dotaf-font-weight-semibold": "600",
      "--dotaf-duration-fast": "120ms",
      "--dotaf-duration-normal": "200ms",
      "--dotaf-ease-out": "cubic-bezier(0.2, 0, 0, 1)",
      "--dotaf-opacity-disabled": "0.5",
      "--dotaf-focus-ring-offset": "2px",
    });
  });

  test("reduced motion zeroes every duration, so components need no media query of their own", () => {
    const css = generateCss(parseConfig({}));

    expect(declarationsOf(css, ":root", "(prefers-reduced-motion: reduce)")).toEqual({
      "--dotaf-duration-fast": "0ms",
      "--dotaf-duration-normal": "0ms",
    });
  });

  test("every token is documented once, telling agents what it is for", () => {
    const tokens = new Set<string>();
    const documented = new Set<string>();
    postcss.parse(generateCss(parseConfig({}))).walkDecls(/^--dotaf-/, (declaration) => {
      tokens.add(declaration.prop);
      const next = declaration.next();
      if (next?.type === "comment" && next.text.length > 0) documented.add(declaration.prop);
    });

    expect(tokens.size).toBeGreaterThan(0);
    expect([...tokens].filter((token) => !documented.has(token))).toEqual([]);
  });

  // The lint rule names tokens in its messages but can't import core, so core holds it to them.
  test("every token the stylelint rule suggests is generated", () => {
    const generated = new Set<string>();
    postcss.parse(generateCss(parseConfig({}))).walkDecls(/^--dotaf-/, (declaration) => {
      generated.add(declaration.prop);
    });

    expect(suggestedTokens.filter((token) => !generated.has(`--dotaf-${token}`))).toEqual([]);
  });

  // A reviewable copy of what `dotaf.css` looks like for the default brand.
  test("the default brand renders the reviewed stylesheet", async () => {
    await expect(generateCss(parseConfig({}))).toMatchFileSnapshot("__snapshots__/default.css");
  });
});
