import type { Config } from "stylelint";
import { messages, ruleName, suggestedTokens, useTokens } from "./use-tokens.js";

export { messages, ruleName, suggestedTokens, useTokens };

/** Extend this in a project's stylelint config to require dotaf tokens for design values. */
const config: Config = {
  plugins: [useTokens],
  rules: { [ruleName]: true },
};

export default config;
