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
      // The browser test helpers the registry's component tests use.
      "@registry-test": fileURLToPath(
        new URL("../../packages/registry/test/browser", import.meta.url),
      ),
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
          // Component tests live with their component in the registry; they run here because
          // they need this app's dotaf.css, and the registry can't depend on @dotaf/core.
          dir: "../..",
          include: [
            "apps/playground/src/**/*.browser.test.tsx",
            "packages/registry/components/**/*.browser.test.tsx",
          ],
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
