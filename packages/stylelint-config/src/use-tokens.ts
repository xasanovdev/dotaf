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
  /** Where raw starts in the value, so repeated values are reported at their own columns. */
  index: number;
  suggestion: string;
}

/** A family of properties whose design values must come from one kind of token. */
interface Category {
  properties: RegExp;
  check: (value: string) => Finding[];
}

// Default sizes, matching what generateCss emits for the default dotaf.json. The step is
// what a suggestion is about: tokens rescale with density and radius, steps don't.
interface Scale {
  kind: string;
  /** A raw value in the steps' unit, or undefined when it can't be compared. */
  measure: (raw: string) => number | undefined;
  /** Each step's default in the scale's own unit: px, weight or ms. */
  steps: { token: string; amount: number }[];
}

const spaceScale: Scale = {
  kind: "spacing",
  measure: pixels,
  steps: [1, 2, 3, 4, 6, 8, 12, 16].map((n) => ({ token: `space-${String(n)}`, amount: n * 4 })),
};
const radiusScale: Scale = {
  kind: "radius",
  measure: pixels,
  steps: [
    { token: "radius-sm", amount: 4 },
    { token: "radius-md", amount: 8 },
    { token: "radius-lg", amount: 12 },
  ],
};
const textScale: Scale = {
  kind: "text",
  measure: pixels,
  steps: [
    { token: "text-xs", amount: 12 },
    { token: "text-sm", amount: 14 },
    { token: "text-base", amount: 16 },
    { token: "text-lg", amount: 18 },
    { token: "text-xl", amount: 20 },
    { token: "text-2xl", amount: 24 },
  ],
};
const weightScale: Scale = {
  kind: "font weight",
  measure: weight,
  steps: [
    { token: "font-weight-normal", amount: 400 },
    { token: "font-weight-medium", amount: 500 },
    { token: "font-weight-semibold", amount: 600 },
  ],
};
const durationScale: Scale = {
  kind: "duration",
  measure: milliseconds,
  steps: [
    { token: "duration-fast", amount: 120 },
    { token: "duration-normal", amount: 200 },
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
const easeToken = "ease-out";
const focusTokens = { ring: "focus-ring", offset: "focus-ring-offset" };

/** Every token a message can suggest; core checks each one exists in what it generates. */
export const suggestedTokens: readonly string[] = [
  ...new Set([
    ...[spaceScale, radiusScale, textScale, weightScale, durationScale].flatMap((scale) =>
      scale.steps.map((s) => s.token),
    ),
    "radius-full",
    ...colorTokens.flatMap((c) => c.tokens.map((token) => `color-${token}`)),
    ...ringColors,
    ...shadowTokens,
    ...fontTokens,
    easeToken,
    focusTokens.ring,
    focusTokens.offset,
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

const keywordWeights: Record<string, number> = {
  normal: 400,
  bold: 700,
  lighter: 300,
  bolder: 700,
};

function weight(raw: string): number | undefined {
  const value = keywordWeights[raw.toLowerCase()] ?? Number(raw);
  return Number.isNaN(value) ? undefined : value;
}

function milliseconds(raw: string): number | undefined {
  const time = valueParser.unit(raw);
  if (time === false) return undefined;
  const unit = time.unit.toLowerCase();
  if (unit === "ms") return Number(time.number);
  if (unit === "s") return Number(time.number) * 1000;
  return undefined;
}

/** The step closest to a raw value, negated through calc() when the value is negative. */
function closestStep(raw: string, scale: Scale): string {
  const value = scale.measure(raw);
  const first = scale.steps[0]?.token ?? "";
  const last = scale.steps.at(-1)?.token ?? "";
  if (value === undefined) {
    return `a ${scale.kind} token (var(--dotaf-${first}) to var(--dotaf-${last}))`;
  }
  const amount = Math.abs(value);
  // Far past the largest step, the nearest one would mislead (a 1s spinner is not 200ms).
  if (amount > 2 * (scale.steps.at(-1)?.amount ?? 0)) {
    return `a ${scale.kind} token (var(--dotaf-${first}) to var(--dotaf-${last}))`;
  }
  const step = scale.steps.reduce((best, s) =>
    Math.abs(s.amount - amount) < Math.abs(best.amount - amount) ? s : best,
  );
  const token = `var(--dotaf-${step.token})`;
  return value < 0 ? `calc(-1 * ${token})` : token;
}

function isLength(word: string): boolean {
  const length = valueParser.unit(word);
  return length !== false && length.unit !== "" && Number(length.number) !== 0;
}

function isNumber(word: string): boolean {
  return valueParser.unit(word) !== false;
}

// Zero needs no token: 0s means "no motion" in any design.
function isTime(word: string): boolean {
  return (milliseconds(word) ?? 0) !== 0;
}

const easings = new Set([
  "ease",
  "ease-in",
  "ease-out",
  "ease-in-out",
  "linear",
  "step-start",
  "step-end",
]);

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
// Hand-written values that come as functions, flagged whole.
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

const easingFunctions = new Set(["cubic-bezier", "steps", "linear"]);

// In each layer the first time is the duration and a second one the delay, which stays free.
function timingCheck(options: { easing: boolean }): Category["check"] {
  const motionTokens = [...durationScale.steps.map((step) => step.token), easeToken];
  const finding = (node: Node, suggestion: string): Finding => ({
    raw: valueParser.stringify(node),
    index: node.sourceIndex,
    suggestion,
  });
  return (value) =>
    layers(value).flatMap((layer) => {
      const findings: Finding[] = [];
      let hasDuration = false;
      for (const node of layer) {
        const name = node.value.toLowerCase();
        if (node.type === "function" && name === "var") {
          const variable = node.nodes[0]?.value ?? "";
          if (variable.startsWith("--dotaf-duration-")) hasDuration = true;
          else if (!variable.startsWith("--dotaf-")) {
            findings.push(finding(node, tokenList(motionTokens)));
          }
        } else if (node.type === "function" && options.easing && easingFunctions.has(name)) {
          findings.push(finding(node, tokenList([easeToken])));
        } else if (node.type === "word" && milliseconds(name) !== undefined) {
          if (!hasDuration && isTime(name)) {
            findings.push(finding(node, closestStep(name, durationScale)));
          }
          hasDuration = true;
        } else if (node.type === "word" && options.easing && easings.has(name)) {
          findings.push(finding(node, tokenList([easeToken])));
        }
      }
      return findings;
    });
}

/** Parts of a value that are design values written by hand instead of tokens. */
function rawParts(
  nodes: Node[],
  isRaw: (word: string) => boolean,
): { raw: string; index: number }[] {
  const raw: { raw: string; index: number }[] = [];
  const add = (node: Node) =>
    raw.push({ raw: valueParser.stringify(node), index: node.sourceIndex });
  valueParser.walk(nodes, (node) => {
    if (node.type === "function") {
      const name = node.value.toLowerCase();
      if (name === "var") {
        if (!node.nodes[0]?.value.startsWith("--dotaf-")) add(node);
        return false;
      }
      if (colorFunctions.has(name)) {
        add(node);
        return false;
      }
      return passThroughFunctions.has(name) ? undefined : false;
    }
    // Quoted strings only appear in checked values as font names.
    if (node.type === "string") {
      add(node);
      return undefined;
    }
    if (node.type !== "word") return undefined;
    const word = node.value.toLowerCase();
    if (!operators.has(word) && !globalKeywords.has(word) && isRaw(word)) add(node);
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
      return parts.length > 0 ? [{ raw: value, index: 0, suggestion: options.suggest(value) }] : [];
    }
    return parts.map(({ raw, index }) => ({ raw, index, suggestion: options.suggest(raw) }));
  };
}

// A blurred layer is an elevation and must be a shadow token. An unblurred one is a ring or
// an edge, which works like a border: its widths are free and only its color must be a token.
/** The comma-separated layers of a value, e.g. each shadow or each transition. */
function layers(value: string): Node[][] {
  const result: Node[][] = [[]];
  for (const node of valueParser(value).nodes) {
    if (node.type === "div" && node.value === ",") result.push([]);
    else result.at(-1)?.push(node);
  }
  return result;
}

function shadowFindings(value: string): Finding[] {
  return layers(value).flatMap((layer) => {
    const lengths = layer.filter((node) => node.type === "word" && isNumber(node.value));
    const blur = lengths[2];
    if (blur !== undefined && isLength(blur.value)) {
      const raw = valueParser.stringify(layer).trim();
      const index = layer.find((node) => node.type !== "space")?.sourceIndex ?? 0;
      return [{ raw, index, suggestion: tokenList(shadowTokens) }];
    }
    return rawParts(layer, isColor).map(({ raw, index }) => ({
      raw,
      index,
      suggestion: tokenList(ringColors),
    }));
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
      suggest: () => `var(--dotaf-font-weight-*), var(--dotaf-text-*) and ${tokenList(fontTokens)}`,
    }),
  },
  { properties: /^(?:box|text)-shadow$/, check: shadowFindings },
  {
    properties: /^font-weight$/,
    check: byWord({ isRaw: () => true, suggest: (raw) => closestStep(raw, weightScale) }),
  },
  {
    // Property names (background-color, transform) and delays stay free.
    properties: /^transition(?:-duration|-timing-function)?$/,
    check: timingCheck({ easing: true }),
  },
  {
    // An animation may need its own easing (a linear spinner); its duration is still a token.
    properties: /^animation(?:-duration)?$/,
    check: timingCheck({ easing: false }),
  },
  // Shorthands like border and background carry widths, styles and positions too;
  // only the colors in them must be tokens.
  ...colorTokens.map(({ properties, tokens }) => ({
    properties,
    check: byWord({ isRaw: isColor, suggest: () => tokenList(tokens.map((t) => `color-${t}`)) }),
  })),
];

// Inside a focus rule the outline is the focus indicator, which has its own tokens.
const focusSelector = /:focus|\[data-focus(?:ed|-visible|-within)\b/;

/** Whether every selector of a rule targets a focus state (`:not(:focus)` doesn't count). */
function isFocusRule(node: unknown): boolean {
  if (typeof node !== "object" || node === null || !("selectors" in node)) return false;
  const { selectors } = node;
  return (
    Array.isArray(selectors) &&
    selectors.every(
      (selector: unknown) =>
        typeof selector === "string" && focusSelector.test(selector.replace(/:not\([^)]*\)/g, "")),
    )
  );
}

// Removing the outline (none, 0) is allowed: React Aria's data-focus-visible draws it back.
const isRawOutline = (word: string) => word !== "none" && (isLength(word) || !isNumber(word));

const focusCategories: Category[] = [
  {
    properties: /^outline$/,
    check: byWord({
      isRaw: isRawOutline,
      wholeValue: true,
      suggest: () => tokenList([focusTokens.ring]),
    }),
  },
  {
    properties: /^outline-(?:width|style)$/,
    check: byWord({ isRaw: isRawOutline, suggest: () => tokenList([focusTokens.ring]) }),
  },
  {
    properties: /^outline-offset$/,
    check: byWord({ isRaw: rawUnless(), suggest: () => tokenList([focusTokens.offset]) }),
  },
];

const rule: Rule = (primary) => (root, result) => {
  if (!validateOptions(result, ruleName, { actual: primary, possible: [true] })) return;

  root.walkDecls((decl) => {
    // Custom properties are where tokens get aliased; only their uses are checked.
    if (decl.prop.startsWith("--")) return;
    const prop = decl.prop.toLowerCase();
    const category = [...(isFocusRule(decl.parent) ? focusCategories : []), ...categories].find(
      (c) => c.properties.test(prop),
    );
    if (category === undefined) return;

    // Indexes are relative to the whole declaration: "prop" + "between" + value.
    const valueStart = decl.prop.length + (decl.raws.between ?? ":").length;
    for (const { raw, index, suggestion } of category.check(decl.value)) {
      report({
        ruleName,
        result,
        node: decl,
        message: messages.rejected(raw, suggestion),
        index: valueStart + index,
        endIndex: valueStart + index + raw.length,
      });
    }
  });
};

rule.ruleName = ruleName;
rule.messages = messages;

export const useTokens = createPlugin(ruleName, rule);
