import { describe, expect, test } from "vitest";
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
        primary: "#4f46e5",
        background: "#0a0a0a",
        foreground: "#fafafa",
        danger: "#dc2626",
        success: "#16a34a",
        warning: "#d97706",
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

  test("user values override defaults and dark inherits light colors", () => {
    const config = parseConfig({
      colors: { primary: "#16a34a" },
      dark: { background: "#111111" },
      radius: "lg",
    });

    expect(config.colors.primary).toBe("#16a34a");
    expect(config.colors.background).toBe("#ffffff");
    expect(config.dark).toMatchObject({
      primary: "#16a34a",
      background: "#111111",
      foreground: "#fafafa",
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

  test("a misspelled key is rejected instead of silently ignored", () => {
    expect(() => parseConfig({ radious: "lg" })).toThrow(/radious/);
  });

  test("the $schema key for editor autocomplete is allowed", () => {
    expect(() =>
      parseConfig({ $schema: "./node_modules/@dotaf/core/dotaf.schema.json" }),
    ).not.toThrow();
  });
});
