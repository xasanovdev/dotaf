import { access } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import { checkComponent, checkComponents } from "../test/check-component.js";
import { fixture } from "../test/fixtures.js";
import { listComponents } from "./index.js";
import { packageComponents } from "./registry.js";

describe("component checks", () => {
  test("a component that agrees with its meta passes", async () => {
    expect(await checkComponent("badge", fixture("components"))).toEqual([]);
  });

  test("a component may import another it lists in registryDependencies", async () => {
    expect(await checkComponent("tag", fixture("components"))).toEqual([]);
  });

  test("drift between the meta and the code is reported", async () => {
    expect(await checkComponent("drifty", fixture("broken"))).toEqual([
      'drifty.json documents "label", which DriftyProps does not have',
      'DriftyProps declares "tone", which drifty.json does not document',
      'drifty.json marks "size" optional, but DriftyProps requires it',
      "styles.missing has no .missing rule in drifty/drifty.module.css",
      'imports "react-aria-components", which drifty.json does not list as a dependency',
      'imports "../ghost/ghost"; import another component by its folder, as "../ghost"',
      'imports "zod", which drifty.json does not list as a dependency',
      'drifty/index.ts must be exactly: export * from "./drifty";',
      'registryDependencies lists "ghost", which the registry does not have',
      'drifty/drifty.tsx must start with "use client" so Next.js server components can render it',
    ]);
  });

  // Runs over the components this package ships; empty until the first component lands.
  test("every shipped component agrees with its meta", async () => {
    const names = (await listComponents()).map(({ name }) => name);

    expect(await checkComponents(names)).toEqual([]);
  });

  // The demo and browser test aren't copied into projects, so the loader doesn't require them;
  // this keeps every shipped component's folder complete.
  test("every shipped component keeps its demo and browser test in its folder", async () => {
    const missing: string[] = [];
    for (const { name } of await listComponents()) {
      for (const file of [`${name}.demo.tsx`, `${name}.browser.test.tsx`]) {
        await access(join(packageComponents, name, file)).catch(() =>
          missing.push(`${name}/${file}`),
        );
      }
    }

    expect(missing).toEqual([]);
  });
});
