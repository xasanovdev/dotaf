import { z } from "zod";

export interface ResolvedConfig {
  colors: Palette;
  /** Dark surfaces plus the accents the user set for dark mode; the rest derive from `colors`. */
  dark: DarkPalette;
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

export type Accent = "primary" | "danger" | "success" | "warning";

export type DarkPalette = Pick<Palette, "background" | "foreground"> &
  Partial<Record<Accent, string | undefined>>;

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
// Function arguments follow CSS Color 4 slot by slot, because a browser drops a color it
// can't parse and every token mixed from it goes too. Rare valid spellings (exponents,
// uppercase, tabs) are rejected: a clear error beats a silently broken theme.
const number = String.raw`-?(?:\d+(?:\.\d+)?|\.\d+)`;
const percent = `${number}%`;
const angle = `${number}(?:deg|grad|rad|turn)?`;
const amount = `(?:${number}%?|none)`;
const hue = `(?:${angle}|none)`;
// Modern syntax: space-separated slots and an optional `/ alpha`.
const modern = (...slots: string[]) => String.raw`${slots.join(" +")}(?: *\/ *${amount})?`;
// Legacy rgb() and hsl(): comma-separated, no `none`, and rgb() can't mix % with numbers.
const legacy = (...slots: string[]) => `${slots.join(" *, *")}(?: *, *${number}%?)?`;
const colorSpace = "srgb|srgb-linear|display-p3|a98-rgb|prophoto-rgb|rec2020|xyz|xyz-d50|xyz-d65";
const colorFunctions = [
  String.raw`rgba?\( *(?:${modern(amount, amount, amount)}|${legacy(number, number, number)}|${legacy(percent, percent, percent)}) *\)`,
  String.raw`hsla?\( *(?:${modern(hue, amount, amount)}|${legacy(angle, percent, percent)}) *\)`,
  String.raw`hwb\( *${modern(hue, amount, amount)} *\)`,
  String.raw`(?:ok)?lab\( *${modern(amount, amount, amount)} *\)`,
  String.raw`(?:ok)?lch\( *${modern(amount, amount, hue)} *\)`,
  String.raw`color\( *(?:${colorSpace}) +${modern(amount, amount, amount)} *\)`,
];
const cssColor = z
  .string()
  .regex(
    new RegExp(
      String.raw`^(?:#(?:[\dA-Fa-f]{3,4}|[\dA-Fa-f]{6}|[\dA-Fa-f]{8})|${colorFunctions.join("|")})$`,
    ),
    { error: "must be a hex color (#4f46e5) or a CSS color function (oklch(0.6 0.2 260))" },
  );

// A family is a quoted name or space-separated words, e.g. `"M+ 1p"` or `Open Sans`.
const fontFamily = String.raw`(?:"[^"\\;{}<>\r\n]*"|'[^'\\;{}<>\r\n]*'|[\w.\u00C0-\uFFFF-]+(?: [\w.\u00C0-\uFFFF-]+)*)`;
const fontStack = z
  .string()
  .regex(new RegExp(String.raw`^ *${fontFamily}(?: *, *${fontFamily})* *$`), {
    error: 'must be comma-separated font families ("Inter, system-ui, sans-serif")',
  });

// Where init and add write files. A dotaf.json may come from someone else's theme, so a path
// stays relative and inside the project, with forward slashes, and the CSS is a .css file.
const insideProject = String.raw`(?![A-Za-z]:)(?!/)(?!(?:[^/]*/)*\.\.(?:/|$))[^\\]+`;
const projectDir = z.string().regex(new RegExp(`^${insideProject}$`), {
  error: "must be a relative path inside the project, like src/components/ui",
});
const projectCss = z.string().regex(new RegExp(String.raw`^${insideProject}\.css$`), {
  error: "must be a .css file inside the project, like src/styles/dotaf.css",
});

/** The choices dotaf.json offers, for tools that ask the user. */
export const radii = ["none", "sm", "md", "lg", "full"] as const;
export const densities = ["compact", "comfortable", "spacious"] as const;

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
  radius: z.enum(radii).default("md"),
  density: z.enum(densities).default("comfortable"),
  paths: z
    .strictObject({
      components: projectDir.default("src/components/ui"),
      css: projectCss.default("src/styles/dotaf.css"),
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

  return { font, radius, density, paths, colors, dark };
}
