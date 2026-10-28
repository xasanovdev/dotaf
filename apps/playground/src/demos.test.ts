import { listComponents } from "@dotaf/registry";
import { expect, test } from "vitest";
import { demos } from "./demos.js";

test("every registry component has a demo", async () => {
  const components = (await listComponents()).map((meta) => meta.name);

  expect(demos.map((demo) => demo.name)).toEqual(components);
});
