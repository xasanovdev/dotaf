import { describe, expect, test } from "vitest";
import { checkComponent } from "../test/check-component.js";
import { fixture } from "../test/fixtures.js";
import { listComponents } from "./index.js";

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
      "styles.missing has no .missing rule in drifty.module.css",
      'imports "react-aria-components", which drifty.json does not list as a dependency',
      'imports "zod", which drifty.json does not list as a dependency',
      'registryDependencies lists "ghost", which the registry does not have',
      'drifty.tsx must start with "use client" so Next.js server components can render it',
    ]);
  });

  // Runs over the components this package ships; empty until the first component lands.
  test("every shipped component agrees with its meta", async () => {
    const metas = await listComponents();
    const problems = await Promise.all(metas.map(({ name }) => checkComponent(name)));

    expect(problems.flat()).toEqual([]);
  });
});
