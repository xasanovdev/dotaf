import type { Accent, Palette, ResolvedConfig } from "./config.js";

/** A CSS custom property, written as `--dotaf-<name>`. */
interface Token {
  name: string;
  value: string;
  /** What the token is for. Emitted as a comment so agents pick the right one. */
  description: string;
}

/** Suffix of a palette token: `fg` is `--dotaf-color-fg`. */
type PaletteColor = "bg" | "fg" | Accent;

function paletteTokens(palette: Palette): Token[] {
  return [
    { name: "color-bg", value: palette.background, description: "Page and surface background." },
    { name: "color-fg", value: palette.foreground, description: "Default text and icons." },
    {
      name: "color-primary",
      value: palette.primary,
      description: "Brand color: primary actions, links, focus rings.",
    },
    {
      name: "color-danger",
      value: palette.danger,
      description: "Destructive actions and error states.",
    },
    {
      name: "color-success",
      value: palette.success,
      description: "Success states and confirmations.",
    },
    {
      name: "color-warning",
      value: palette.warning,
      description: "Warnings and states that need attention.",
    },
  ];
}

// A brand color picked for a light page is often unreadable on a dark one, so accents the
// user didn't set for dark mode are lifted to lightness 0.7 or more, keeping the hue. That
// clears 4.5:1 on a near-black dark.background; a translucent color keeps its alpha.
function darkPalette({ colors, dark }: ResolvedConfig): Palette {
  const accent = (name: Accent) => dark[name] ?? `oklch(from ${colors[name]} max(l, 0.7) c h)`;
  return {
    background: dark.background,
    foreground: dark.foreground,
    primary: accent("primary"),
    danger: accent("danger"),
    success: accent("success"),
    warning: accent("warning"),
  };
}

// Mixing in oklch keeps lightness steps even across hues.
function mix(color: PaletteColor, percent: string, base: PaletteColor): string {
  return `color-mix(in oklch, var(--dotaf-color-${color}) ${percent}, var(--dotaf-color-${base}))`;
}

// White or black text, whichever has more WCAG contrast on the fill. Below relative
// luminance 0.179 (the `y` channel of xyz-d65) white wins; `t` is 1 there and 0 above,
// scaling the D65 white point to white or black. `/ 1` keeps the text opaque on a
// translucent fill. OKLCH lightness can't decide this: saturated reds read lighter than
// their luminance.
function readableOn(fill: PaletteColor): string {
  const t = "clamp(0, (0.179 - y) * 1000, 1)";
  return `color(from var(--dotaf-color-${fill}) xyz-d65 calc(${t} * 0.9505) ${t} calc(${t} * 1.089) / 1)`;
}

// Mixing toward the foreground darkens in light mode and lightens in dark mode.
const derivedTokens: Token[] = [
  {
    name: "color-muted",
    value: mix("fg", "6%", "bg"),
    description: "Subtle fill: hovered rows, disabled fields, code blocks.",
  },
  {
    name: "color-muted-fg",
    value: mix("fg", "60%", "bg"),
    description: "Secondary text: hints, placeholders, captions.",
  },
  { name: "color-border", value: mix("fg", "15%", "bg"), description: "Borders and dividers." },
  {
    name: "color-primary-hover",
    value: mix("primary", "85%", "fg"),
    description: "Primary fill while hovered or pressed.",
  },
  {
    name: "color-on-primary",
    value: readableOn("primary"),
    description: "Text and icons on a primary fill.",
  },
  {
    name: "color-danger-hover",
    value: mix("danger", "85%", "fg"),
    description: "Danger fill while hovered or pressed.",
  },
  {
    name: "color-on-danger",
    value: readableOn("danger"),
    description: "Text and icons on a danger fill.",
  },
  {
    name: "color-control-border",
    value: mix("fg", "45%", "bg"),
    description: "Outline of a form control (input, checkbox, switch track): 3:1 on the page.",
  },
  {
    name: "focus-ring",
    value: "2px solid var(--dotaf-color-primary)",
    description:
      "Outline of a focused control; pair with outline-offset: var(--dotaf-focus-ring-offset).",
  },
];

const radiusScales = {
  none: ["0", "0", "0"],
  sm: ["0.125rem", "0.25rem", "0.375rem"],
  md: ["0.25rem", "0.5rem", "0.75rem"],
  lg: ["0.5rem", "0.75rem", "1rem"],
  full: ["9999px", "9999px", "1.5rem"],
} satisfies Record<ResolvedConfig["radius"], [string, string, string]>;

const spaceUnits = {
  compact: "0.2rem",
  comfortable: "0.25rem",
  spacious: "0.3rem",
} satisfies Record<ResolvedConfig["density"], string>;

// Multiples of the space unit above 1, kept as text because they are only written into CSS.
const spaceSteps = ["2", "3", "4", "6", "8", "12", "16"];

const fixedTokens: Token[] = [
  { name: "radius-full", value: "9999px", description: "Pills and circles: switches, avatars." },
  { name: "text-xs", value: "0.75rem", description: "Captions, badges and fine print." },
  { name: "text-sm", value: "0.875rem", description: "Labels, secondary text, dense controls." },
  { name: "text-base", value: "1rem", description: "Body text and default control text." },
  { name: "text-lg", value: "1.125rem", description: "Lead paragraphs and card titles." },
  { name: "text-xl", value: "1.25rem", description: "Section headings." },
  { name: "text-2xl", value: "1.5rem", description: "Page titles." },
  {
    name: "shadow-sm",
    value: "0 1px 2px rgb(0 0 0 / 0.06)",
    description: "Slight lift: buttons, inputs.",
  },
  {
    name: "shadow-md",
    value: "0 4px 8px -2px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.06)",
    description: "Raised surfaces: cards, menus, popovers.",
  },
  {
    name: "shadow-lg",
    value: "0 12px 24px -4px rgb(0 0 0 / 0.12), 0 4px 8px -4px rgb(0 0 0 / 0.08)",
    description: "Overlays: dialogs and sheets.",
  },
  { name: "font-weight-normal", value: "400", description: "Body text." },
  { name: "font-weight-medium", value: "500", description: "Labels and buttons." },
  { name: "font-weight-semibold", value: "600", description: "Titles and headings." },
  {
    name: "duration-fast",
    value: "120ms",
    description: "Hover, press and toggle feedback. 0ms under reduced motion.",
  },
  {
    name: "duration-normal",
    value: "200ms",
    description: "Things entering or leaving: popovers, dialogs. 0ms under reduced motion.",
  },
  {
    name: "ease-out",
    value: "cubic-bezier(0.2, 0, 0, 1)",
    description: "Easing for every transition: fast start, gentle stop.",
  },
  { name: "opacity-disabled", value: "0.5", description: "A disabled control, dimmed as a whole." },
  {
    name: "focus-ring-offset",
    value: "2px",
    description: "Outline offset that goes with var(--dotaf-focus-ring).",
  },
];

// Components animate with the duration tokens, so zeroing them here honors reduced motion
// everywhere without a media query in each component.
const reducedMotion = fixedTokens
  .filter((token) => token.name.startsWith("duration-"))
  .map((token) => declaration({ ...token, value: "0ms" }));

/** Tokens that do not change with the theme. */
function rootTokens(config: ResolvedConfig): Token[] {
  const [sm, md, lg] = radiusScales[config.radius];
  return [
    { name: "radius-sm", value: sm, description: "Small corners: checkboxes, badges, tags." },
    { name: "radius-md", value: md, description: "Control corners: buttons, inputs, selects." },
    { name: "radius-lg", value: lg, description: "Container corners: cards, dialogs, popovers." },
    {
      name: "space-unit",
      value: spaceUnits[config.density],
      description: "Base spacing unit set by density. Use the space-N steps instead.",
    },
    {
      name: "space-1",
      value: "var(--dotaf-space-unit)",
      description: "1 spacing unit: padding, gaps, margins.",
    },
    ...spaceSteps.map((step) => ({
      name: `space-${step}`,
      value: `calc(var(--dotaf-space-unit) * ${step})`,
      description: `${step} spacing units: padding, gaps, margins.`,
    })),
    { name: "font-sans", value: config.font.sans, description: "Interface and body text." },
    {
      name: "font-mono",
      value: config.font.mono,
      description: "Code, keyboard shortcuts, tabular numbers.",
    },
    ...fixedTokens,
  ];
}

function declaration(token: Token): string {
  return `--dotaf-${token.name}: ${token.value};`;
}

function documented(token: Token): string {
  return `${declaration(token)} /* ${token.description} */`;
}

function block(selector: string, declarations: string[], indent = ""): string {
  const body = declarations.map((line) => `${indent}  ${line}`).join("\n");
  return `${indent}${selector} {\n${body}\n${indent}}\n`;
}

const header = `/*
 * Generated by dotaf from dotaf.json. Edit dotaf.json, not this file.
 * Theme a subtree with data-theme="light" or data-theme="dark"; derived colors
 * (muted, border, hover, on-*) recompute only on elements that carry data-theme.
 */
`;

export function generateCss(config: ResolvedConfig): string {
  const light = ["color-scheme: light;", ...paletteTokens(config.colors).map(documented)];
  // Already documented in the light block.
  const dark = ["color-scheme: dark;", ...paletteTokens(darkPalette(config)).map(declaration)];

  return [
    header,
    block(":root", rootTokens(config).map(documented)),
    block(':root,\n[data-theme="light"]', light),
    block('[data-theme="dark"]', dark),
    `@media (prefers-color-scheme: dark) {\n${block(':root:not([data-theme="light"])', dark, "  ")}}\n`,
    // Custom properties resolve var() where they are declared, so derived values are
    // redeclared on every theme root to follow that root's palette.
    block(":root,\n[data-theme]", derivedTokens.map(documented)),
    `@media (prefers-reduced-motion: reduce) {\n${block(":root", reducedMotion, "  ")}}\n`,
  ].join("\n");
}
