import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

import { dotafCss } from "./dotaf-css.js";

export default defineConfig({
  plugins: [react(), dotafCss()],
  resolve: {
    // Registry components live outside this app; one React copy must serve both.
    dedupe: ["react", "react-dom", "react-aria-components"],
    // Components are imported straight from the registry source, the files users copy.
    alias: {
      "@registry": fileURLToPath(new URL("../../packages/registry/components", import.meta.url)),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: { name: "node", include: ["src/**/*.test.ts"], environment: "node" },
      },
      {
        extends: true,
        test: {
          name: "browser",
          include: ["src/**/*.browser.test.tsx"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
