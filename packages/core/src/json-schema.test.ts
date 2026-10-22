import { describe, expect, test } from "vitest";
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

  test("the editor accepts the same colors the parser accepts", () => {
    expect(editorVerdicts(patternOf("colors", "primary"), "#4F46E5")).toEqual([true, true]);
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
