import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, test, vi } from "vitest";
import { run, type Io } from "./cli.js";

const projects: string[] = [];

async function project(files: Record<string, string>): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "dotaf-cli-"));
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

/** Runs the CLI in a project and captures what it prints. */
async function dotaf(args: string[], cwd: string, overrides: Partial<Io> = {}) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await run(args, {
    cwd,
    interactive: false,
    version: "1.2.3",
    out: (line) => out.push(line),
    err: (line) => err.push(line),
    ...overrides,
  });
  return { code, out: out.join("\n"), err: err.join("\n") };
}

describe("dotaf init", () => {
  test("--yes writes the files with defaults and prints the next steps", async () => {
    const root = await project(vite);

    const { code, out } = await dotaf(["init", "--yes"], root);

    expect(code).toBe(0);
    expect(await readFile(join(root, "src/styles/dotaf.css"), "utf8")).toContain("--dotaf-");
    expect(out).toContain("Wrote dotaf.json and src/styles/dotaf.css");
    expect(out).toContain("src/main.tsx");
    expect(out).toContain('import "./styles/dotaf.css";');
    expect(out).toContain("pnpm add react-aria-components");
    expect(out).toContain("claude mcp add dotaf -- npx dotaf mcp");
  });

  test("in a terminal it asks for the brand and writes the answers", async () => {
    const root = await project(vite);
    const askBrand = vi.fn().mockResolvedValue({ colors: { primary: "#16a34a" }, radius: "full" });

    const { code } = await dotaf(["init"], root, { interactive: true, askBrand });

    expect(code).toBe(0);
    expect(askBrand).toHaveBeenCalledOnce();
    expect(JSON.parse(await readFile(join(root, "dotaf.json"), "utf8"))).toMatchObject({
      colors: { primary: "#16a34a" },
      radius: "full",
    });
  });

  test("a cancelled askBrand writes nothing", async () => {
    const root = await project(vite);

    const { code, err } = await dotaf(["init"], root, {
      interactive: true,
      askBrand: () => Promise.resolve(undefined),
    });

    expect(code).toBe(1);
    expect(err).toContain("Cancelled");
    await expect(readFile(join(root, "dotaf.json"), "utf8")).rejects.toThrow();
  });

  test("a rerun keeps dotaf.json without asking and refreshes the CSS", async () => {
    const root = await project({ ...vite, "dotaf.json": "{}" });
    const askBrand = vi.fn();

    const { code, out } = await dotaf(["init"], root, { interactive: true, askBrand });

    expect(code).toBe(0);
    expect(askBrand).not.toHaveBeenCalled();
    expect(out).toContain("Kept dotaf.json; regenerated src/styles/dotaf.css");
  });

  test("--theme over an existing dotaf.json fails and points at --force", async () => {
    const root = await project({
      ...vite,
      "dotaf.json": "{}",
      "brand.json": JSON.stringify({ radius: "lg" }),
    });

    const { code, err } = await dotaf(["init", "--theme", "brand.json"], root);

    expect(code).toBe(1);
    expect(err).toContain("--force");
    expect(await readFile(join(root, "dotaf.json"), "utf8")).toBe("{}");
  });

  test("--theme with --force replaces dotaf.json", async () => {
    const root = await project({
      ...vite,
      "dotaf.json": "{}",
      "brand.json": JSON.stringify({ radius: "lg" }),
    });

    const { code } = await dotaf(["init", "--theme", "brand.json", "--force"], root);

    expect(code).toBe(0);
    expect(await readFile(join(root, "dotaf.json"), "utf8")).toContain('"radius": "lg"');
  });
});

describe("dotaf add", () => {
  const withConfig = { ...vite, "dotaf.json": JSON.stringify({}) };

  test("copies the components and prints what was added and what to install", async () => {
    const root = await project(withConfig);

    const { code, out } = await dotaf(["add", "button", "checkbox"], root);

    expect(code).toBe(0);
    expect(await readFile(join(root, "src/components/ui/checkbox.tsx"), "utf8")).toContain(
      "export function Checkbox",
    );
    expect(out).toContain(
      "Added button: src/components/ui/button.tsx, src/components/ui/button.module.css",
    );
    expect(out).toContain("Added checkbox:");
    expect(out).toContain("pnpm add react-aria-components");
  });

  test("an existing file is kept and the output says how to replace it", async () => {
    const root = await project({ ...withConfig, "src/components/ui/button.tsx": "// mine\n" });

    const { code, out } = await dotaf(["add", "button"], root);

    expect(code).toBe(0);
    expect(out).toContain(
      "Kept button: src/components/ui/button.tsx already exists; src/components/ui/button.module.css is missing. Add --overwrite to replace it.",
    );
    expect(await readFile(join(root, "src/components/ui/button.tsx"), "utf8")).toBe("// mine\n");
  });

  test("an unknown component is one clean line listing the ones that exist", async () => {
    const { code, err } = await dotaf(["add", "buton"], await project(withConfig));

    expect(code).toBe(1);
    expect(err).toMatch(/^No component named "buton". Available: button, card/);
  });

  test("without component names it prints usage and fails", async () => {
    const { code, err } = await dotaf(["add"], await project(withConfig));

    expect(code).toBe(1);
    expect(err).toContain("dotaf add <component...>");
  });
});

describe("dotaf", () => {
  test.each([["--help"], ["help"], ["init", "--help"]])(
    "%s prints usage and succeeds",
    async (...args) => {
      const { code, out } = await dotaf(args, await project({}));

      expect(code).toBe(0);
      expect(out).toContain("Usage: dotaf init");
    },
  );

  test("--version prints the version", async () => {
    const { code, out } = await dotaf(["--version"], await project({}));

    expect(code).toBe(0);
    expect(out).toBe("dotaf 1.2.3");
  });

  test("a failure an agent can act on is one clean line on stderr, not a stack trace", async () => {
    const { code, err } = await dotaf(
      ["init", "--theme", "http://127.0.0.1:9/x.json"],
      await project(vite),
    );

    expect(code).toBe(1);
    expect(err).toMatch(/^Could not download http:\/\/127\.0\.0\.1:9\/x\.json: /);
    expect(err).not.toContain("    at ");
  });

  test("an unknown command prints usage and fails", async () => {
    const { code, err } = await dotaf(["paint"], await project({}));

    expect(code).toBe(1);
    expect(err).toContain("Usage: dotaf init");
  });
});
