import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import postcss from "postcss";
import { afterEach, describe, expect, test } from "vitest";

import {
  describeComponent,
  describeDesignSystem,
  DotafConfigError,
  DotafProjectNotFoundError,
  generateCss,
  listProjectComponents,
  parseConfig,
  RegistryError,
} from "./index.js";

const folders: string[] = [];

/** A throwaway folder holding the given files. */
async function folder(files: Record<string, string>): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "dotaf-design-"));
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

function project(config: Record<string, unknown> = {}, files: Record<string, string> = {}) {
  return folder({
    "package.json": "{}",
    "pnpm-lock.yaml": "",
    "dotaf.json": JSON.stringify({
      paths: { components: "src/ui", css: "src/dotaf.css" },
      ...config,
    }),
    ...files,
  });
}

describe("describeDesignSystem", () => {
  test("describes every token dotaf.css declares, each once, with what it is for", async () => {
    const { tokens } = await describeDesignSystem(await project());

    const declared = new Set<string>();
    postcss.parse(generateCss(parseConfig({}))).walkDecls(/^--dotaf-/, (decl) => {
      declared.add(decl.prop);
    });
    expect(tokens.map((token) => token.name).sort()).toEqual([...declared].sort());
    for (const token of tokens) expect(token.description).not.toBe("");
  });

  test("a color token carries its light value and its dark value", async () => {
    const { tokens } = await describeDesignSystem(
      await project({ colors: { primary: "#16a34a" }, dark: { danger: "#ff6b6b" } }),
    );
    const token = (name: string) => tokens.find((t) => t.name === `--dotaf-color-${name}`);

    expect(token("primary")).toMatchObject({
      value: "#16a34a",
      dark: "oklch(from #16a34a max(l, 0.7) c h)",
    });
    expect(token("danger")).toMatchObject({ value: "#dc2626", dark: "#ff6b6b" });
    expect(tokens.find((t) => t.name === "--dotaf-radius-md")).not.toHaveProperty("dark");
  });

  test("reports where the project keeps its CSS and components", async () => {
    expect(await describeDesignSystem(await project())).toMatchObject({
      paths: { css: "src/dotaf.css", components: "src/ui" },
    });
  });

  test("every token a rule names is one the project has", async () => {
    const { tokens, rules } = await describeDesignSystem(await project());
    const names = new Set(tokens.map((token) => token.name));

    const named = rules.flatMap((rule) => [...rule.matchAll(/--dotaf-[a-z0-9-]+[a-z0-9]/g)]);
    expect(named.length).toBeGreaterThan(0);
    expect(named.map(([name]) => name).filter((name) => !names.has(name))).toEqual([]);
  });

  test("finds dotaf.json from a subfolder of the project", async () => {
    const root = await project({}, { "src/app/page.tsx": "" });

    const { paths } = await describeDesignSystem(join(root, "src/app"));

    expect(paths.css).toBe("src/dotaf.css");
  });

  test("finds dotaf.json from a file inside the project", async () => {
    const root = await project({}, { "src/app/page.tsx": "" });

    const { paths } = await describeDesignSystem(join(root, "src/app/page.tsx"));

    expect(paths.css).toBe("src/dotaf.css");
  });

  test("from above the project, as in a monorepo root, the error names the dotaf.json below", async () => {
    const config = JSON.stringify({});
    const repo = await folder({
      "package.json": "{}",
      "apps/web/dotaf.json": config,
      "apps/docs/site/dotaf.json": config,
      "node_modules/some-theme/dotaf.json": config,
      ".cache/dotaf.json": config,
    });

    const error = await describeDesignSystem(repo).catch((caught: unknown) => caught);

    // Absolute, so the caller can use them as they are wherever it started.
    const found = [join(repo, "apps/docs/site"), join(repo, "apps/web")];
    expect(error).toBeInstanceOf(DotafProjectNotFoundError);
    expect(error).toMatchObject({ found });
    expect((error as Error).message).toContain(
      `Found dotaf.json in ${found.join(", ")}: work from one of them.`,
    );
    expect((error as Error).message).not.toContain("node_modules");
    expect((error as Error).message).not.toContain(".cache");
  });

  test("a folder that doesn't exist is named as such, not as a project to init", async () => {
    const missing = join(await project(), "apps/nope");

    const error = await describeDesignSystem(missing).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(DotafConfigError);
    expect((error as Error).message).toBe(`${missing} does not exist.`);
  });

  test("without dotaf.json it says to run init", async () => {
    await expect(describeDesignSystem(await folder({ "package.json": "{}" }))).rejects.toThrow(
      DotafConfigError,
    );
    await expect(describeDesignSystem(await folder({ "package.json": "{}" }))).rejects.toThrow(
      "npx dotaf init",
    );
  });
});

describe("listProjectComponents", () => {
  test("lists every registry component with what it is for, none installed yet", async () => {
    const components = await listProjectComponents(await project());

    expect(components.map((c) => c.name)).toEqual([
      "button",
      "card",
      "checkbox",
      "switch",
      "text-field",
    ]);
    expect(components[0]).toEqual({
      name: "button",
      description: expect.stringContaining("Triggers an action") as string,
      installed: [],
    });
  });

  test("names the files of a component already in paths.components", async () => {
    const root = await project({}, { "src/ui/button.tsx": "// edited\n" });

    const button = (await listProjectComponents(root)).find((c) => c.name === "button");

    expect(button?.installed).toEqual(["src/ui/button.tsx"]);
  });
});

describe("describeComponent", () => {
  test("returns the component's meta, its source and where the project has it", async () => {
    const root = await project(
      {},
      {
        "src/ui/button.tsx": "",
        "src/ui/button.module.css": "",
      },
    );

    const button = await describeComponent(root, "button");

    expect(button.meta.example).toContain("<Button");
    expect(button.files.map((file) => file.path)).toEqual(["button.tsx", "button.module.css"]);
    expect(button.files[0]?.content).toContain("export function Button");
    expect(button.installed).toEqual(["src/ui/button.tsx", "src/ui/button.module.css"]);
  });

  test("gives the command that installs the npm packages the project still lacks", async () => {
    expect(await describeComponent(await project(), "button")).toMatchObject({
      install: "pnpm add react-aria-components",
    });

    const ready = await project(
      {},
      {
        "package.json": JSON.stringify({ dependencies: { "react-aria-components": "^1.0.0" } }),
      },
    );
    expect(await describeComponent(ready, "button")).not.toHaveProperty("install");
  });

  test("an unknown name lists the components there are", async () => {
    const root = await project();

    await expect(describeComponent(root, "dialogg")).rejects.toThrow(RegistryError);
    await expect(describeComponent(root, "dialogg")).rejects.toThrow("Available: button");
  });
});
