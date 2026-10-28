import { describe, expect, test } from "vitest";
import { invalidColors, validColors } from "./color-samples.fixture.js";
import { configJsonSchema } from "./index.js";

interface FieldSchemas {
  properties: Record<string, { properties: Record<string, { pattern?: string }> } | undefined>;
}

function patternOf(group: string, field: string): string {
  const pattern = (configJsonSchema() as unknown as FieldSchemas).properties[group]?.properties[
    field
  ]?.pattern;
  if (pattern === undefined) throw new Error(`no pattern for ${group}.${field}`);
  return pattern;
}

// Editors may compile schema patterns with or without the `u` flag; both must agree.
function editorVerdicts(pattern: string, value: string): boolean[] {
  return ["", "u"].map((flags) => new RegExp(pattern, flags).test(value));
}

describe("configJsonSchema", () => {
  test("every field is optional, matching how users write dotaf.json", () => {
    expect(configJsonSchema()).not.toHaveProperty("required");
  });

  test("editors can offer the radius options", () => {
    expect(configJsonSchema()).toMatchObject({
      properties: { radius: { enum: ["none", "sm", "md", "lg", "full"] } },
    });
  });

  test.each(validColors)("the editor accepts the color %s like the parser", (color) => {
    expect(editorVerdicts(patternOf("colors", "primary"), color)).toEqual([true, true]);
  });

  test.each(invalidColors)("the editor rejects the color %s like the parser", (color) => {
    expect(editorVerdicts(patternOf("colors", "primary"), color)).toEqual([false, false]);
  });

  test("the editor judges paths like the parser: relative, inside the project", () => {
    expect(editorVerdicts(patternOf("paths", "css"), "src/styles/dotaf.css")).toEqual([true, true]);
    for (const bad of ["../x.css", "/x.css", "src/main.tsx"]) {
      expect(editorVerdicts(patternOf("paths", "css"), bad)).toEqual([false, false]);
    }
    expect(editorVerdicts(patternOf("paths", "components"), "../ui")).toEqual([false, false]);
  });

  test("the editor accepts the same font stacks the parser accepts", () => {
    expect(editorVerdicts(patternOf("font", "sans"), "'Open Sans', system-ui")).toEqual([
      true,
      true,
    ]);
  });

  test("the editor rejects the same font stacks the parser rejects", () => {
    expect(editorVerdicts(patternOf("font", "sans"), "Inter; } * {")).toEqual([false, false]);
  });
});
