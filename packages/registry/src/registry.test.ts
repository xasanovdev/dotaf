import { describe, expect, test } from "vitest";

import { fixture } from "../test/fixtures.js";
import { getComponent, listComponents, RegistryError } from "./index.js";

const components = fixture("components");

describe("listComponents", () => {
  test("returns the meta of every component folder, skipping files and dot folders", async () => {
    const metas = await listComponents(components);

    expect(metas.map((meta) => meta.name)).toEqual(["badge", "tag"]);
    expect(metas[0]).toMatchObject({
      description: "A short status label shown next to other content.",
      dependencies: ["react-aria-components"],
      registryDependencies: [],
      props: [
        { name: "variant", default: '"neutral"', required: false },
        { name: "ref", required: false },
        { name: "children", required: false },
      ],
    });
  });

  test.each([
    ["invalid", /badge\/badge\.json is invalid:[\s\S]*description/],
    ["malformed", /badge\/badge\.json is invalid:[\s\S]*JSON/],
    ["misnamed", /badge\/badge\.json is invalid:\n {2}- name: must match its folder name "badge"/],
    [
      "incomplete",
      /badge is missing badge\/badge\.tsx, badge\/badge\.module\.css, badge\/index\.ts/,
    ],
    ["metaless", /badge is missing badge\/badge\.json/],
  ])("a %s component fails with the file and what is wrong", async (root, message) => {
    const list = listComponents(fixture(root));

    await expect(list).rejects.toThrow(RegistryError);
    await expect(list).rejects.toThrow(message);
  });

  test("the package's own components folder is read by default", async () => {
    await expect(listComponents()).resolves.toBeInstanceOf(Array);
  });
});

describe("getComponent", () => {
  test("returns the meta and the source files, ready to copy", async () => {
    const badge = await getComponent("badge", components);

    expect(badge.meta.name).toBe("badge");
    expect(badge.files.map((file) => file.path)).toEqual([
      "badge/badge.tsx",
      "badge/badge.module.css",
      "badge/index.ts",
    ]);
    expect(badge.files[0]?.content).toContain("export function Badge");
  });

  test("an unknown name fails and lists the components that exist", async () => {
    await expect(getComponent("buton", components)).rejects.toThrow(/buton[\s\S]*badge/);
  });
});
