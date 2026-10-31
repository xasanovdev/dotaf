import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
  globalIgnores(["**/dist/", "**/coverage/", "**/.turbo/"]),
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // Components ship to user projects, so accessibility rules run at the strictest level.
    files: ["**/*.tsx"],
    extends: [reactHooks.configs.flat.recommended, jsxA11y.flatConfigs.strict],
    languageOptions: { globals: globals.browser },
  },
  // core's layers (AGENTS.md): commands/ → project/ → config/. Static imports only.
  {
    files: ["packages/core/src/config/**/*.ts"],
    ignores: ["**/*.test.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: String.raw`^(?!(zod(/.*)?|\./.*)$)`,
              message: "config/ is pure: it imports only its siblings and zod.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["packages/core/src/project/**/*.ts"],
    ignores: ["**/*.test.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              // commands/, or the public index ("..", "../index", "../index.js").
              regex: String.raw`^\.\.(/commands/.*|/index(\.[jt]s)?)?$`,
              message: "project/ sits below commands/: it may import config/, not commands/.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.js"],
    extends: [tseslint.configs.disableTypeChecked],
  },
);
