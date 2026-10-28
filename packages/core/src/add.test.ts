import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { addComponents, DotafConfigError } from "./index.js";

const folders: string[] = [];

/** A throwaway folder holding the given files. */
async function folder(files: Record<string, string>): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "dotaf-add-"));
  folders.push(root);
  for (const [path, content] of Object.entries(files)) {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await writeFile(join(root, path), content);
  }
  return root;
}

afterEach(async () => {
  await Promise.all(folders.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

const app = {
  "package.json": JSON.stringify({ devDependencies: { vite: "^8.0.0" } }),
  "pnpm-lock.yaml": "",
  "dotaf.json": JSON.stringify({ paths: { components: "src/components/ui" } }),
};

/** A registry entry: meta plus the two source files, in the flat layout. */
function entry(name: string, meta: Record<string, unknown> = {}) {
  return {
    [`${name}.json`]: JSON.stringify({
      name,
      description: `The ${name}.`,
      example: `<${name} />`,
      dependencies: ["react-aria-components"],
      ...meta,
    }),
    [`${name}.tsx`]: `// ${name}\n`,
    [`${name}.module.css`]: `.root {}\n`,
  };
}

describe("addComponents", () => {
  test("copies a component's files side by side into paths.components", async () => {
    const root = await folder(app);

    const result = await addComponents(root, ["button"]);

    expect(result.added).toEqual([
      {
        name: "button",
        files: ["src/components/ui/button.tsx", "src/components/ui/button.module.css"],
      },
    ]);
    expect(await readFile(join(root, "src/components/ui/button.tsx"), "utf8")).toContain(
      "export function Button",
    );
    expect(result.install).toBe("pnpm add react-aria-components");
  });

  test("adds several components at once, each once", async () => {
    const root = await folder(app);

    const result = await addComponents(root, ["button", "checkbox", "button"]);

    expect(result.added.map((component) => component.name)).toEqual(["button", "checkbox"]);
  });

  test("an existing file is kept unless overwrite is asked for", async () => {
    const root = await folder({ ...app, "src/components/ui/button.tsx": "// mine\n" });

    const kept = await addComponents(root, ["button"]);

    expect(kept.added).toEqual([]);
    expect(kept.kept).toEqual([
      {
        name: "button",
        existing: ["src/components/ui/button.tsx"],
        missing: ["src/components/ui/button.module.css"],
      },
    ]);
    expect(await readFile(join(root, "src/components/ui/button.tsx"), "utf8")).toBe("// mine\n");

    const replaced = await addComponents(root, ["button"], { overwrite: true });

    expect(replaced.added.map((component) => component.name)).toEqual(["button"]);
    expect(await readFile(join(root, "src/components/ui/button.tsx"), "utf8")).toContain(
      "export function Button",
    );
  });

  test("components a component uses are added too, and say who needed them", async () => {
    const registry = await folder({
      ...entry("button"),
      ...entry("dialog", { registryDependencies: ["button"] }),
    });
    const root = await folder(app);

    const result = await addComponents(root, ["dialog"], { registry });

    expect(result.added).toEqual([
      {
        name: "dialog",
        files: ["src/components/ui/dialog.tsx", "src/components/ui/dialog.module.css"],
      },
      {
        name: "button",
        files: ["src/components/ui/button.tsx", "src/components/ui/button.module.css"],
        neededBy: "dialog",
      },
    ]);
  });

  test("an unknown component fails and lists the ones that exist", async () => {
    await expect(addComponents(await folder(app), ["buton"])).rejects.toThrow(/buton[\s\S]*button/);
  });

  test("a project without dotaf.json is pointed at dotaf init", async () => {
    const root = await folder({ "package.json": "{}" });

    await expect(addComponents(root, ["button"])).rejects.toThrow(DotafConfigError);
    await expect(addComponents(root, ["button"])).rejects.toThrow(/dotaf init/);
  });

  test("no install step when the dependencies are already there", async () => {
    const root = await folder({
      ...app,
      "package.json": JSON.stringify({ dependencies: { "react-aria-components": "^1.0.0" } }),
    });

    expect((await addComponents(root, ["button"])).install).toBeUndefined();
  });

  test("overwrite replaces only what was named; a component already there for another is kept", async () => {
    const registry = await folder({
      ...entry("button"),
      ...entry("dialog", { registryDependencies: ["button"] }),
    });
    const root = await folder({ ...app, "src/components/ui/button.tsx": "// mine\n" });

    const result = await addComponents(root, ["dialog"], { registry, overwrite: true });

    expect(result.added.map((component) => component.name)).toEqual(["dialog"]);
    expect(result.kept).toMatchObject([{ name: "button", neededBy: "dialog" }]);
    expect(await readFile(join(root, "src/components/ui/button.tsx"), "utf8")).toBe("// mine\n");
  });

  test("a dependency missing from the registry names the component that needs it", async () => {
    const registry = await folder(entry("ghost", { registryDependencies: ["nope"] }));

    await expect(addComponents(await folder(app), ["ghost"], { registry })).rejects.toThrow(
      /ghost needs "nope"/,
    );
  });

  test("every unknown name is reported at once, before anything is written", async () => {
    const root = await folder(app);

    await expect(addComponents(root, ["card", "buton", "chekbox"])).rejects.toThrow(
      /"buton", "chekbox"[\s\S]*Available: button/,
    );
    await expect(readFile(join(root, "src/components/ui/card.tsx"), "utf8")).rejects.toThrow();
  });

  test("from a subfolder it finds the project by its dotaf.json", async () => {
    const root = await folder({ ...app, "src/pages/.keep": "" });

    const result = await addComponents(join(root, "src/pages"), ["button"]);

    expect(result.added[0]?.files).toContain("src/components/ui/button.tsx");
    expect(await readFile(join(root, "src/components/ui/button.tsx"), "utf8")).toContain("Button");
  });

  test("paths.components that is a file fails with a clear message", async () => {
    const root = await folder({
      ...app,
      "dotaf.json": JSON.stringify({ paths: { components: "ui" } }),
      ui: "not a folder",
    });

    await expect(addComponents(root, ["button"])).rejects.toThrow(
      /paths\.components.*ui.*not a folder/,
    );
  });
});
