import { z } from "zod";

export interface ResolvedConfig {
  colors: Palette;
  dark: Palette;
  font: { sans: string; mono: string };
  radius: "none" | "sm" | "md" | "lg" | "full";
  density: "compact" | "comfortable" | "spacious";
  paths: { components: string; css: string };
}

export interface Palette {
  primary: string;
  background: string;
  foreground: string;
  danger: string;
  success: string;
  warning: string;
}

export class DotafConfigError extends Error {
  override name = "DotafConfigError";

  constructor(
    summary: string,
    readonly issues: readonly string[] = [],
  ) {
    super([summary, ...issues.map((issue) => `  - ${issue}`)].join("\n"));
  }
}

// Values are written straight into a CSS file, so the allowed syntax is narrow enough
// that a value cannot close its declaration (no `;`, `{`, `}`).
// Patterns use no flags and no `\p{...}`: JSON Schema drops flags, and editors compile
// patterns with or without `u`, so every pattern must mean the same in both modes.
const cssColor = z
  .string()
  .regex(
    /^(?:#(?:[\dA-Fa-f]{3,4}|[\dA-Fa-f]{6}|[\dA-Fa-f]{8})|(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\([\w\s.%,/-]+\))$/,
    { error: "must be a hex color (#4f46e5) or a CSS color function (oklch(0.6 0.2 260))" },
  );

// A family is a quoted name or space-separated words, e.g. `"M+ 1p"` or `Open Sans`.
const fontFamily = String.raw`(?:"[^"\\;{}<>\r\n]*"|'[^'\\;{}<>\r\n]*'|[\w.\u00C0-\uFFFF-]+(?: [\w.\u00C0-\uFFFF-]+)*)`;
const fontStack = z
  .string()
  .regex(new RegExp(String.raw`^ *${fontFamily}(?: *, *${fontFamily})* *$`), {
    error: 'must be comma-separated font families ("Inter, system-ui, sans-serif")',
  });

const configSchema = z.strictObject({
  $schema: z.string().optional(),
  colors: z
    .strictObject({
      primary: cssColor.default("#4f46e5"),
      background: cssColor.default("#ffffff"),
      foreground: cssColor.default("#0a0a0a"),
      danger: cssColor.default("#dc2626"),
      success: cssColor.default("#16a34a"),
      warning: cssColor.default("#d97706"),
    })
    .prefault({}),
  dark: z
    .strictObject({
      primary: cssColor.optional(),
      background: cssColor.default("#0a0a0a"),
      foreground: cssColor.default("#fafafa"),
      danger: cssColor.optional(),
      success: cssColor.optional(),
      warning: cssColor.optional(),
    })
    .prefault({}),
  font: z
    .strictObject({
      sans: fontStack.default("Inter, system-ui, sans-serif"),
      mono: fontStack.default("ui-monospace, monospace"),
    })
    .prefault({}),
  radius: z.enum(["none", "sm", "md", "lg", "full"]).default("md"),
  density: z.enum(["compact", "comfortable", "spacious"]).default("comfortable"),
  paths: z
    .strictObject({
      components: z.string().default("src/components/ui"),
      css: z.string().default("src/styles/dotaf.css"),
    })
    .prefault({}),
});

/** What users write in dotaf.json: every field optional. */
export type DotafConfig = z.input<typeof configSchema>;

export function configJsonSchema(): Record<string, unknown> {
  // "input" describes what users write; "output" would mark every defaulted field required.
  return z.toJSONSchema(configSchema, { io: "input" });
}

/** `source` names the config in error messages, e.g. the file path it came from. */
export function parseConfig(input: unknown, source = "dotaf.json"): ResolvedConfig {
  const result = configSchema.safeParse(input);
  if (!result.success) {
    throw new DotafConfigError(
      `${source} is invalid:`,
      result.error.issues.map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`),
    );
  }
  const { colors, dark, font, radius, density, paths } = result.data;

  // Dark mode has its own surfaces; every other color follows the light palette
  // unless the user overrides it.
  return {
    font,
    radius,
    density,
    paths,
    colors,
    dark: {
      primary: dark.primary ?? colors.primary,
      background: dark.background,
      foreground: dark.foreground,
      danger: dark.danger ?? colors.danger,
      success: dark.success ?? colors.success,
      warning: dark.warning ?? colors.warning,
    },
  };
}
