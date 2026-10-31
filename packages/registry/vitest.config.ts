import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Component browser tests sit in components/ but run in the playground, which serves
    // dotaf.css; here only the Node tests of the registry API run.
    include: ["src/**/*.test.ts"],
  },
});
