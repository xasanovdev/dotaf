import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

import { brandDefaults, DotafConfigError, updateTheme, type ThemeChanges } from "./index.js";

const folders: string[] = [];

async function folder(files: Record<string, string>): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "dotaf-theme-"));
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

const paths = { components: "src/ui", css: "src/dotaf.css" };

function project(config: Record<string, unknown> = {}) {
  return folder({ "package.json": "{}", "dotaf.json": JSON.stringify({ ...config, paths }) });
}

/** Changes as an agent's JSON may send them: unchecked, so updateTheme must validate them. */
function fromAgent(changes: Record<string, unknown>): ThemeChanges {
  return changes;
}

async function configOf(root: string): Promise<unknown> {
  return JSON.parse(await readFile(join(root, "dotaf.json"), "utf8"));
}

describe("brandDefaults", () => {
  test("lists every field a theme can set with dotaf's default; a dark accent is derived", () => {
    const defaults = brandDefaults();

    expect(defaults.get("colors.primary")).toBe("#4f46e5");
    expect(defaults.get("dark.background")).toBe("#0a0a0a");
    expect(defaults.has("dark.primary")).toBe(true);
    expect(defaults.get("dark.primary")).toBeUndefined();
    expect(defaults.get("font.sans")).toBe("Inter, system-ui, sans-serif");
    expect(defaults.get("radius")).toBe("md");
    expect([...defaults.keys()].some((field) => field.startsWith("paths"))).toBe(false);
  });
});

describe("updateTheme", () => {
  test("merges the changes into dotaf.json and keeps every value it didn't name", async () => {
    const root = await project({ colors: { danger: "#b91c1c" }, radius: "sm" });

    await updateTheme(root, { colors: { primary: "#16a34a" }, density: "compact" });

    expect(await configOf(root)).toEqual({
      colors: { danger: "#b91c1c", primary: "#16a34a" },
      radius: "sm",
      density: "compact",
      paths,
    });
  });

  test("regenerates dotaf.css at once, so the new brand shows without another command", async () => {
    const root = await project();

    const result = await updateTheme(root, { colors: { primary: "#16a34a" } });

    expect(result.css).toBe("src/dotaf.css");
    expect(await readFile(join(root, "src/dotaf.css"), "utf8")).toContain(
      "--dotaf-color-primary: #16a34a;",
    );
  });

  test("reports each value that changed, before and after, as the project resolves it", async () => {
    const root = await project({ radius: "sm" });

    const { changed } = await updateTheme(root, {
      colors: { primary: "#16a34a" },
      radius: "sm",
      dark: { primary: "#4ade80" },
    });

    expect(changed).toEqual([
      { field: "colors.primary", from: "#4f46e5", to: "#16a34a" },
      { field: "dark.primary", from: undefined, to: "#4ade80" },
    ]);
  });

  test("null removes a value: it falls back to the default, and a dark accent is derived again", async () => {
    const root = await project({ colors: { primary: "#16a34a" }, dark: { primary: "#4ade80" } });

    const { changed } = await updateTheme(root, {
      colors: { primary: null },
      dark: { primary: null },
    });

    expect(await configOf(root)).toEqual({ paths });
    expect(changed).toEqual([
      { field: "colors.primary", from: "#16a34a", to: "#4f46e5" },
      { field: "dark.primary", from: "#4ade80", to: undefined },
    ]);
  });

  test("a change to the current value writes nothing, keeping the file as the user formatted it", async () => {
    const root = await folder({
      "package.json": "{}",
      "dotaf.json": `{ "radius": "sm", "paths": ${JSON.stringify(paths)} }`,
    });

    const result = await updateTheme(root, { radius: "sm" });

    expect(result.changed).toEqual([]);
    expect(await readFile(join(root, "dotaf.json"), "utf8")).toBe(
      `{ "radius": "sm", "paths": ${JSON.stringify(paths)} }`,
    );
  });

  test("an invalid value is rejected with the reason, and nothing is written", async () => {
    const root = await project();
    const before = await readFile(join(root, "dotaf.json"), "utf8");

    const error = await updateTheme(
      root,
      fromAgent({ colors: { primary: "green-ish", primry: "#16a34a" }, radius: "huge" }),
    ).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(DotafConfigError);
    expect((error as Error).message).toContain("colors.primary: must be a hex color");
    expect((error as Error).message).toContain("primry");
    expect((error as Error).message).toContain("radius");
    expect(await readFile(join(root, "dotaf.json"), "utf8")).toBe(before);
  });

  test("a theme is the brand only: paths and $schema can't be changed through it", async () => {
    const root = await project();

    await expect(updateTheme(root, fromAgent({ paths: { css: "elsewhere.css" } }))).rejects.toThrow(
      "paths and $schema can't be changed by a theme update",
    );
    await expect(updateTheme(root, fromAgent({ $schema: "x" }))).rejects.toThrow(DotafConfigError);
  });

  test("works from a subfolder or a file inside the project", async () => {
    const root = await project();
    await mkdir(join(root, "src/app"), { recursive: true });

    await updateTheme(join(root, "src/app"), { radius: "lg" });

    expect(await configOf(root)).toMatchObject({ radius: "lg" });
  });
});
