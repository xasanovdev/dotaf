import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, onTestFinished, test, vi } from "vitest";
import {
  DotafConfigError,
  DotafConfigExistsError,
  detectProject,
  initProject,
  readTheme,
} from "./index.js";

const projects: string[] = [];

/** A throwaway project folder holding the given files. */
async function project(files: Record<string, string>): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "dotaf-init-"));
  projects.push(root);
  for (const [path, content] of Object.entries(files)) {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await writeFile(join(root, path), content);
  }
  return root;
}

afterEach(async () => {
  await Promise.all(projects.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

const vite = {
  "package.json": JSON.stringify({ devDependencies: { vite: "^8.0.0" } }),
  "pnpm-lock.yaml": "",
  "src/main.tsx": "",
};
const nextApp = {
  "package.json": JSON.stringify({ dependencies: { next: "^16.0.0" } }),
  "package-lock.json": "{}",
  "app/layout.tsx": "",
};

/** Serves one JSON body on a local port for the length of a test. */
async function serve(body: unknown): Promise<string> {
  const server = createServer((_, response) => {
    response.setHeader("content-type", "application/json");
    response.end(JSON.stringify(body));
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  onTestFinished(() => {
    server.close();
  });
  const address = server.address();
  const port = typeof address === "object" && address !== null ? address.port : 0;
  return `http://127.0.0.1:${String(port)}/theme.json`;
}

describe("detectProject", () => {
  test("recognises a Vite app, its package manager and its entry file", async () => {
    expect(await detectProject(await project(vite))).toMatchObject({
      framework: "vite",
      packageManager: "pnpm",
      entry: "src/main.tsx",
      hasConfig: false,
    });
  });

  test("recognises a Next.js app router, with or without src/", async () => {
    expect(await detectProject(await project(nextApp))).toMatchObject({
      framework: "next",
      packageManager: "npm",
      entry: "app/layout.tsx",
    });
    const withSrc = await project({
      "package.json": JSON.stringify({ dependencies: { next: "^16.0.0" } }),
      "yarn.lock": "",
      "src/app/layout.tsx": "",
    });
    expect(await detectProject(withSrc)).toMatchObject({
      packageManager: "yarn",
      entry: "src/app/layout.tsx",
    });
  });

  test("an app inside a monorepo uses the lockfile of the workspace root", async () => {
    const root = await project({ "pnpm-lock.yaml": "", "apps/web/package.json": "{}" });

    expect(await detectProject(join(root, "apps/web"))).toMatchObject({ packageManager: "pnpm" });
  });

  test("a declared packageManager wins over a stray lockfile", async () => {
    const root = await project({
      "package.json": JSON.stringify({ packageManager: "npm@10.9.0" }),
      "yarn.lock": "",
    });

    expect(await detectProject(root)).toMatchObject({ packageManager: "npm" });
  });
});

describe("initProject", () => {
  test("writes dotaf.json from the answers and dotaf.css where the framework keeps styles", async () => {
    const root = await project(vite);
    const askBrand = vi.fn().mockResolvedValue({ colors: { primary: "#16a34a" }, radius: "lg" });

    const result = await initProject(root, { askBrand });

    expect(JSON.parse(await readFile(join(root, "dotaf.json"), "utf8"))).toMatchObject({
      colors: { primary: "#16a34a" },
      radius: "lg",
      paths: { css: "src/styles/dotaf.css", components: "src/components/ui" },
    });
    expect(await readFile(join(root, "src/styles/dotaf.css"), "utf8")).toContain(
      "--dotaf-color-primary: #16a34a;",
    );
    expect(result).toMatchObject({
      wroteConfig: true,
      css: "src/styles/dotaf.css",
      importInto: { file: "src/main.tsx", statement: 'import "./styles/dotaf.css";' },
      install: "pnpm add react-aria-components",
      connectAgent: "claude mcp add dotaf -- npx dotaf mcp",
    });
  });

  test("a Next.js app keeps dotaf.css next to its root layout", async () => {
    const root = await project(nextApp);

    expect(await initProject(root, {})).toMatchObject({
      css: "app/dotaf.css",
      importInto: { file: "app/layout.tsx", statement: 'import "./dotaf.css";' },
      install: "npm install react-aria-components",
    });
  });

  test("a cancelled question writes nothing", async () => {
    const root = await project(vite);

    expect(await initProject(root, { askBrand: () => Promise.resolve(undefined) })).toBeUndefined();
    await expect(readFile(join(root, "dotaf.json"), "utf8")).rejects.toThrow();
  });

  test("a rerun keeps dotaf.json as it is, without asking, and regenerates dotaf.css", async () => {
    const root = await project(vite);
    await initProject(root, {});
    const edited = JSON.stringify({
      colors: { primary: "#dc2626" },
      paths: { css: "src/tokens.css" },
    });
    await writeFile(join(root, "dotaf.json"), edited);
    const askBrand = vi.fn();

    const result = await initProject(root, { askBrand });

    expect(askBrand).not.toHaveBeenCalled();
    expect(result?.wroteConfig).toBe(false);
    expect(await readFile(join(root, "dotaf.json"), "utf8")).toBe(edited);
    expect(await readFile(join(root, "src/tokens.css"), "utf8")).toContain(
      "--dotaf-color-primary: #dc2626;",
    );
  });

  test("a dotaf.json saved with a byte order mark still reads", async () => {
    const root = await project({
      ...vite,
      "dotaf.json": `\uFEFF${JSON.stringify({ radius: "lg" })}`,
    });

    expect(await initProject(root, {})).toMatchObject({ wroteConfig: false });
  });

  test("the import step is left out once the entry file imports dotaf.css", async () => {
    const root = await project({ ...vite, "src/main.tsx": 'import "./styles/dotaf.css";\n' });

    expect((await initProject(root, {}))?.importInto).toBeUndefined();
  });

  test("a new theme never silently replaces an existing dotaf.json", async () => {
    const theme = await serve({ colors: { primary: "#16a34a" } });
    const root = await project({ ...vite, "dotaf.json": "{}" });

    await expect(initProject(root, { theme })).rejects.toThrow(DotafConfigExistsError);

    await initProject(root, { theme, force: true });
    expect(await readFile(join(root, "dotaf.json"), "utf8")).toContain("#16a34a");
  });

  test("a theme sets the brand but never where files go", async () => {
    const root = await project({
      ...vite,
      "theme.json": JSON.stringify({
        $schema: "https://example.com/other.json",
        radius: "full",
        paths: { css: "elsewhere/brand.css" },
      }),
    });

    const result = await initProject(root, { theme: "theme.json" });

    const written = JSON.parse(await readFile(join(root, "dotaf.json"), "utf8")) as {
      $schema: string;
      radius: string;
      paths: { css: string };
    };
    expect(written.radius).toBe("full");
    expect(written.paths.css).toBe("src/styles/dotaf.css");
    expect(written.$schema).toContain("@dotaf/core");
    expect(result?.css).toBe("src/styles/dotaf.css");
  });

  test("a folder without package.json is refused: init belongs in a project's root", async () => {
    await expect(initProject(await project({}), {})).rejects.toThrow(/package\.json/);
  });

  test("no install step when react-aria-components is already a dependency", async () => {
    const root = await project({
      ...vite,
      "package.json": JSON.stringify({
        dependencies: { "react-aria-components": "^1.0.0" },
        devDependencies: { vite: "^8.0.0" },
      }),
    });

    expect((await initProject(root, {}))?.install).toBeUndefined();
  });
});

describe("readTheme", () => {
  test("reads a theme file relative to the project", async () => {
    const root = await project({ "brand/dotaf.json": JSON.stringify({ radius: "full" }) });

    expect(await readTheme("brand/dotaf.json", root)).toEqual({ radius: "full" });
  });

  test("an invalid theme fails with where it came from and what is wrong", async () => {
    const root = await project({ "theme.json": JSON.stringify({ colors: { primary: "red;}" } }) });

    await expect(readTheme("theme.json", root)).rejects.toThrow(
      /theme\.json[\s\S]*colors\.primary/,
    );
  });

  test("reads a theme from an http(s) URL", async () => {
    expect(await readTheme(await serve({ density: "compact" }), tmpdir())).toEqual({
      density: "compact",
    });
  });

  test("an unreachable URL or a folder fails as a theme error, not a crash", async () => {
    await expect(readTheme("http://127.0.0.1:9/theme.json", tmpdir())).rejects.toThrow(
      DotafConfigError,
    );
    await expect(readTheme(".", await project({}))).rejects.toThrow(DotafConfigError);
  });
});
