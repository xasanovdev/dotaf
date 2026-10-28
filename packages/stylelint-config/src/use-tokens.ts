import valueParser, { type Node } from "postcss-value-parser";
import stylelint, { type Rule } from "stylelint";
import { namedColors } from "./named-colors.js";

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions },
} = stylelint;

export const ruleName = "dotaf/use-tokens";

export const messages = ruleMessages(ruleName, {
  rejected: (raw: string, suggestion: string) => `Use ${suggestion} instead of ${raw}`,
});

/** A hand-written design value and the token(s) to use instead. */
interface Finding {
  raw: string;
  suggestion: string;
}

/** A family of properties whose design values must come from one kind of token. */
interface Category {
  properties: RegExp;
  check: (value: string) => Finding[];
}

// Default sizes in px, matching what generateCss emits for the default dotaf.json. The step
// is what a suggestion is about: tokens rescale with density and radius, steps don't.
interface Scale {
  kind: string;
  steps: { token: string; px: number }[];
}

const spaceScale: Scale = {
  kind: "spacing",
  steps: [1, 2, 3, 4, 6, 8, 12, 16].map((n) => ({ token: `space-${String(n)}`, px: n * 4 })),
};
const radiusScale: Scale = {
  kind: "radius",
  steps: [
    { token: "radius-sm", px: 4 },
    { token: "radius-md", px: 8 },
    { token: "radius-lg", px: 12 },
  ],
};
const textScale: Scale = {
  kind: "text",
  steps: [
    { token: "text-xs", px: 12 },
    { token: "text-sm", px: 14 },
    { token: "text-base", px: 16 },
    { token: "text-lg", px: 18 },
    { token: "text-xl", px: 20 },
    { token: "text-2xl", px: 24 },
  ],
};

// Which color tokens are meant for which properties, most likely first.
const colorTokens: { properties: RegExp; tokens: string[] }[] = [
  { properties: /^(?:color|text-decoration(?:-color)?)$/, tokens: ["fg", "muted-fg"] },
  { properties: /^background(?:-color|-image)?$/, tokens: ["bg", "muted", "primary"] },
  { properties: /^(?:border|column-rule)(?:-.+)?$/, tokens: ["border"] },
  { properties: /^(?:outline(?:-color)?|caret-color|accent-color)$/, tokens: ["primary"] },
  { properties: /^(?:fill|stroke)$/, tokens: ["fg", "primary"] },
];
const ringColors = ["color-border", "color-primary"];
const shadowTokens = ["shadow-sm", "shadow-md", "shadow-lg"];
const fontTokens = ["font-sans", "font-mono"];

/** Every token a message can suggest; core checks each one exists in what it generates. */
export const suggestedTokens: readonly string[] = [
  ...new Set([
    ...[spaceScale, radiusScale, textScale].flatMap((scale) => scale.steps.map((s) => s.token)),
    "radius-full",
    ...colorTokens.flatMap((c) => c.tokens.map((token) => `color-${token}`)),
    ...ringColors,
    ...shadowTokens,
    ...fontTokens,
  ]),
];

const tokenList = (tokens: readonly string[]) =>
  orList(tokens.map((token) => `var(--dotaf-${token})`));

function orList(items: readonly string[]): string {
  return items.length <= 1
    ? items.join("")
    : `${items.slice(0, -1).join(", ")} or ${items.at(-1) ?? ""}`;
}

// rem is taken at the default 16px.
function pixels(raw: string): number | undefined {
  const length = valueParser.unit(raw);
  if (length === false) return undefined;
  const unit = length.unit.toLowerCase();
  const value = Number(length.number);
  if (unit === "px") return value;
  if (unit === "rem") return value * 16;
  return undefined;
}

/** The step closest to a px or rem value, negated through calc() when the value is negative. */
function closestStep(raw: string, scale: Scale): string {
  const px = pixels(raw);
  const first = scale.steps[0]?.token ?? "";
  const last = scale.steps.at(-1)?.token ?? "";
  if (px === undefined) {
    return `a ${scale.kind} token (var(--dotaf-${first}) to var(--dotaf-${last}))`;
  }
  const size = Math.abs(px);
  const step = scale.steps.reduce((best, s) =>
    Math.abs(s.px - size) < Math.abs(best.px - size) ? s : best,
  );
  const token = `var(--dotaf-${step.token})`;
  return px < 0 ? `calc(-1 * ${token})` : token;
}

function isLength(word: string): boolean {
  const length = valueParser.unit(word);
  return length !== false && length.unit !== "" && Number(length.number) !== 0;
}

function isNumber(word: string): boolean {
  return valueParser.unit(word) !== false;
}

function isColor(word: string): boolean {
  return word.startsWith("#") || namedColors.has(word);
}

/** Lengths are raw, and so is any word that isn't one of the given keywords. */
function rawUnless(...keywords: string[]): (word: string) => boolean {
  return (word) => isLength(word) || (!isNumber(word) && !keywords.includes(word));
}

const globalKeywords = new Set(["inherit", "initial", "unset", "revert", "revert-layer"]);
const operators = new Set(["+", "-", "*", "/"]);
// Functions whose arguments are checked like the value itself.
const passThroughFunctions = new Set([
  "calc",
  "min",
  "max",
  "clamp",
  "color-mix",
  "linear-gradient",
  "radial-gradient",
  "conic-gradient",
  "repeating-linear-gradient",
  "repeating-radial-gradient",
  "repeating-conic-gradient",
]);
const colorFunctions = new Set([
  "rgb",
  "rgba",
  "hsl",
  "hsla",
  "hwb",
  "lab",
  "lch",
  "oklab",
  "oklch",
  "color",
]);

/** Parts of a value that are design values written by hand instead of tokens. */
function rawParts(nodes: Node[], isRaw: (word: string) => boolean): string[] {
  const raw: string[] = [];
  valueParser.walk(nodes, (node) => {
    if (node.type === "function") {
      const name = node.value.toLowerCase();
      if (name === "var") {
        if (!node.nodes[0]?.value.startsWith("--dotaf-")) raw.push(valueParser.stringify(node));
        return false;
      }
      if (colorFunctions.has(name)) {
        raw.push(valueParser.stringify(node));
        return false;
      }
      return passThroughFunctions.has(name) ? undefined : false;
    }
    // Quoted strings only appear in checked values as font names.
    if (node.type === "string") {
      raw.push(valueParser.stringify(node));
      return undefined;
    }
    if (node.type !== "word") return undefined;
    const word = node.value.toLowerCase();
    if (!operators.has(word) && !globalKeywords.has(word) && isRaw(word)) raw.push(node.value);
    return undefined;
  });
  return raw;
}

/** Reports each raw part, or the whole value once when its parts make one choice. */
function byWord(options: {
  isRaw: (word: string) => boolean;
  suggest: (raw: string) => string;
  wholeValue?: boolean;
}): Category["check"] {
  return (value) => {
    const parts = rawParts(valueParser(value).nodes, options.isRaw);
    if (options.wholeValue === true) {
      return parts.length > 0 ? [{ raw: value, suggestion: options.suggest(value) }] : [];
    }
    return parts.map((raw) => ({ raw, suggestion: options.suggest(raw) }));
  };
}

// A blurred layer is an elevation and must be a shadow token. An unblurred one is a ring or
// an edge, which works like a border: its widths are free and only its color must be a token.
function shadowFindings(value: string): Finding[] {
  const layers: Node[][] = [[]];
  for (const node of valueParser(value).nodes) {
    if (node.type === "div" && node.value === ",") layers.push([]);
    else layers.at(-1)?.push(node);
  }
  return layers.flatMap((layer) => {
    const lengths = layer.filter((node) => node.type === "word" && isNumber(node.value));
    const blur = lengths[2];
    if (blur !== undefined && isLength(blur.value)) {
      return [{ raw: valueParser.stringify(layer).trim(), suggestion: tokenList(shadowTokens) }];
    }
    return rawParts(layer, isColor).map((raw) => ({ raw, suggestion: tokenList(ringColors) }));
  });
}

// Order matters: border-radius must match radius before border matches color.
const categories: Category[] = [
  {
    properties: /^(?:margin|padding)(?:-.+)?$|^(?:row-|column-)?gap$/,
    check: byWord({
      isRaw: rawUnless("auto", "normal"),
      suggest: (raw) => closestStep(raw, spaceScale),
    }),
  },
  {
    properties: /^border(?:-.+)?-radius$/,
    check: byWord({
      isRaw: rawUnless(),
      suggest: (raw) =>
        raw === "50%" || (pixels(raw) ?? 0) >= 9999
          ? tokenList(["radius-full"])
          : closestStep(raw, radiusScale),
    }),
  },
  {
    properties: /^font-size$/,
    check: byWord({ isRaw: rawUnless(), suggest: (raw) => closestStep(raw, textScale) }),
  },
  {
    properties: /^font-family$/,
    check: byWord({ isRaw: rawUnless(), wholeValue: true, suggest: () => tokenList(fontTokens) }),
  },
  {
    properties: /^font$/,
    check: byWord({
      isRaw: rawUnless(
        ...["normal", "italic", "oblique", "bold", "bolder", "lighter", "small-caps"],
        ...["caption", "icon", "menu", "message-box", "small-caption", "status-bar"],
      ),
      wholeValue: true,
      suggest: () => `var(--dotaf-text-*) and ${tokenList(fontTokens)}`,
    }),
  },
  { properties: /^(?:box|text)-shadow$/, check: shadowFindings },
  // Shorthands like border and background carry widths, styles and positions too;
  // only the colors in them must be tokens.
  ...colorTokens.map(({ properties, tokens }) => ({
    properties,
    check: byWord({ isRaw: isColor, suggest: () => tokenList(tokens.map((t) => `color-${t}`)) }),
  })),
];

const rule: Rule = (primary) => (root, result) => {
  if (!validateOptions(result, ruleName, { actual: primary, possible: [true] })) return;

  root.walkDecls((decl) => {
    // Custom properties are where tokens get aliased; only their uses are checked.
    if (decl.prop.startsWith("--")) return;
    const prop = decl.prop.toLowerCase();
    const category = categories.find((c) => c.properties.test(prop));
    if (category === undefined) return;

    for (const { raw, suggestion } of category.check(decl.value)) {
      report({
        ruleName,
        result,
        node: decl,
        message: messages.rejected(raw, suggestion),
        word: raw,
      });
    }
  });
};

rule.ruleName = ruleName;
rule.messages = messages;

export const useTokens = createPlugin(ruleName, rule);
