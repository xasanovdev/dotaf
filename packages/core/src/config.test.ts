import { describe, expect, test } from "vitest";
import { invalidColors, validColors } from "./color-samples.fixture.js";
import { DotafConfigError, parseConfig } from "./index.js";

describe("parseConfig", () => {
  test("an empty config resolves to the default brand", () => {
    expect(parseConfig({})).toEqual({
      colors: {
        primary: "#4f46e5",
        background: "#ffffff",
        foreground: "#0a0a0a",
        danger: "#dc2626",
        success: "#16a34a",
        warning: "#d97706",
      },
      dark: {
        background: "#0a0a0a",
        foreground: "#fafafa",
      },
      font: {
        sans: "Inter, system-ui, sans-serif",
        mono: "ui-monospace, monospace",
      },
      radius: "md",
      density: "comfortable",
      paths: {
        components: "src/components/ui",
        css: "src/styles/dotaf.css",
      },
    });
  });

  test("user values override defaults, and dark keeps only the accents the user set", () => {
    const config = parseConfig({
      colors: { primary: "#1d4ed8" },
      dark: { background: "#111111", danger: "#ff6b6b" },
      radius: "lg",
    });

    expect(config.colors.primary).toBe("#1d4ed8");
    expect(config.colors.background).toBe("#ffffff");
    expect(config.dark).toEqual({
      background: "#111111",
      foreground: "#fafafa",
      danger: "#ff6b6b",
    });
    expect(config.radius).toBe("lg");
  });

  test("a color that could inject CSS is rejected with the field path", () => {
    const parse = () => parseConfig({ colors: { primary: "red; } body { display: none" } });

    expect(parse).toThrow(DotafConfigError);
    expect(parse).toThrow(/colors\.primary/);
  });

  test("CSS color functions are accepted", () => {
    expect(parseConfig({ colors: { primary: "oklch(0.62 0.19 260)" } }).colors.primary).toBe(
      "oklch(0.62 0.19 260)",
    );
  });

  test.each(validColors)("the color %s is accepted", (primary) => {
    expect(parseConfig({ colors: { primary } }).colors.primary).toBe(primary);
  });

  test.each(invalidColors)("the color %s is rejected with the field path", (primary) => {
    expect(() => parseConfig({ colors: { primary } })).toThrow(/colors\.primary/);
  });

  test("a font stack that could inject CSS is rejected with the field path", () => {
    expect(() => parseConfig({ font: { sans: "Inter; } * { color: red" } })).toThrow(/font\.sans/);
  });

  test("a font stack with an unclosed quote is rejected", () => {
    expect(() => parseConfig({ font: { sans: '"Inter, sans-serif' } })).toThrow(/font\.sans/);
  });

  test("quoted font names may contain characters unquoted names cannot", () => {
    expect(parseConfig({ font: { sans: '"M+ 1p", sans-serif' } }).font.sans).toBe(
      '"M+ 1p", sans-serif',
    );
  });

  // A dotaf.json can arrive as someone else's theme, so where it writes must stay safe.
  test.each(["src/main.tsx", "../outside.css", "/etc/dotaf.css", "C:/dotaf.css", "src\\dotaf.css"])(
    "paths.css %s is rejected: it must be a .css file inside the project",
    (css) => {
      expect(() => parseConfig({ paths: { css } })).toThrow(/paths\.css/);
    },
  );

  test("paths.components must stay inside the project", () => {
    expect(() => parseConfig({ paths: { components: "../shared/ui" } })).toThrow(
      /paths\.components/,
    );
    expect(
      parseConfig({ paths: { css: "app/dotaf.css", components: "components/ui" } }).paths,
    ).toEqual({
      css: "app/dotaf.css",
      components: "components/ui",
    });
  });

  test("a misspelled key is rejected instead of silently ignored", () => {
    expect(() => parseConfig({ radious: "lg" })).toThrow(/radious/);
  });

  test("the $schema key for editor autocomplete is allowed", () => {
    expect(() =>
      parseConfig({ $schema: "./node_modules/@dotaf/core/dotaf.schema.json" }),
    ).not.toThrow();
  });
});
