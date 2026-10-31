// Component browser tests run in the playground's Vitest (see apps/playground/vite.config.ts),
// which provides these; the registry declares them so its typecheck covers the tests too.

/// <reference types="@vitest/browser-playwright" />

// Served by the playground's dotaf-css Vite plugin from its dotaf.json.
declare module "virtual:dotaf.css";
