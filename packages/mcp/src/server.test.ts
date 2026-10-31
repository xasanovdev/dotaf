import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterEach, describe, expect, test } from "vitest";

import { createServer } from "./index.js";

const folders: string[] = [];
const clients: Client[] = [];

async function folder(files: Record<string, string>): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "dotaf-mcp-"));
  folders.push(root);
  for (const [path, content] of Object.entries(files)) {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await writeFile(join(root, path), content);
  }
  return root;
}

afterEach(async () => {
  await Promise.all(clients.splice(0).map((client) => client.close()));
  await Promise.all(folders.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

function project(files: Record<string, string> = {}) {
  return folder({
    "package.json": "{}",
    "pnpm-lock.yaml": "",
    "dotaf.json": JSON.stringify({
      colors: { primary: "#16a34a" },
      paths: { components: "src/ui", css: "src/dotaf.css" },
    }),
    ...files,
  });
}

/** A client talking to a dotaf server for the project at `cwd`, as an agent would. */
async function connect(cwd: string): Promise<Client> {
  const server = createServer({ cwd, version: "1.2.3" });
  const client = new Client({ name: "test-agent", version: "0.0.0" });
  clients.push(client);
  const [serverSide, clientSide] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverSide), client.connect(clientSide)]);
  return client;
}

async function call(cwd: string, name: string, args: Record<string, unknown> = {}) {
  const result = await (await connect(cwd)).callTool({ name, arguments: args });
  const content = result.content as { type: string; text: string }[];
  return { text: content.map((part) => part.text).join("\n"), isError: result.isError === true };
}

describe("dotaf MCP server", () => {
  test("offers the read tools, each saying when to call it and marked read-only", async () => {
    const { tools } = await (await connect(await project())).listTools();

    expect(tools.map((tool) => tool.name)).toEqual([
      "get_design_system",
      "list_components",
      "get_component",
    ]);
    for (const tool of tools) {
      expect(tool.description).toMatch(/^Call (before|when)/);
      expect(tool.annotations).toMatchObject({ readOnlyHint: true, openWorldHint: false });
    }
  });

  test("every tool takes an optional path to the folder or file the UI work is in", async () => {
    const { tools } = await (await connect(await project())).listTools();

    for (const tool of tools) {
      expect(tool.inputSchema.properties).toHaveProperty("path");
      expect(tool.inputSchema.required ?? []).not.toContain("path");
    }
  });

  // Claude Code starts stdio servers in the git root, which in a monorepo is above the app.
  describe("started at a monorepo root", () => {
    async function monorepo() {
      return folder({
        "package.json": "{}",
        "apps/web/package.json": "{}",
        "apps/web/dotaf.json": JSON.stringify({ paths: { components: "src/ui" } }),
        "apps/web/src/main.tsx": "",
      });
    }

    test("without a path, the error names the app that has dotaf.json and says to pass it", async () => {
      const repo = await monorepo();

      const { text, isError } = await call(repo, "get_design_system");

      expect(isError).toBe(true);
      expect(text).toContain(`Found dotaf.json in ${join(repo, "apps/web")}`);
      expect(text).toContain("Call again with path set to one of them.");
    });

    test("a mistyped path says it doesn't exist rather than asking for init", async () => {
      const { text, isError } = await call(await monorepo(), "list_components", {
        path: "apps/wbe",
      });

      expect(isError).toBe(true);
      expect(text).toContain("apps/wbe does not exist.");
      expect(text).not.toContain("init");
    });

    test("path says what a relative path is read from: the folder the server started in", async () => {
      const repo = await monorepo();
      const { tools } = await (await connect(repo)).listTools();

      for (const tool of tools) {
        expect(JSON.stringify(tool.inputSchema.properties?.["path"])).toContain(repo);
      }
    });

    test.each([
      ["a relative folder", "apps/web"],
      ["a file in the app", "apps/web/src/main.tsx"],
    ])("each tool works from %s", async (_, path) => {
      const repo = await monorepo();

      for (const [name, args] of [
        ["get_design_system", { path }],
        ["list_components", { path }],
        ["get_component", { name: "button", path }],
      ] as const) {
        expect(await call(repo, name, args)).toMatchObject({ isError: false });
      }
    });

    test("an absolute path works too", async () => {
      const repo = await monorepo();

      const { isError } = await call(repo, "list_components", { path: join(repo, "apps/web") });

      expect(isError).toBe(false);
    });

    test("the instructions tell the agent to pass the path in a monorepo", async () => {
      expect((await connect(await monorepo())).getInstructions()).toContain("path");
    });
  });

  test("introduces itself to the agent: look up the design system before writing UI", async () => {
    const client = await connect(await project());

    expect(client.getServerVersion()).toMatchObject({ name: "dotaf", version: "1.2.3" });
    expect(client.getInstructions()).toContain("get_design_system");
  });

  test("get_design_system gives the rules, every token with its purpose, and dark values", async () => {
    const { text, isError } = await call(await project(), "get_design_system");

    expect(isError).toBe(false);
    expect(text).toContain("src/dotaf.css");
    expect(text).toContain("var(--dotaf-focus-ring)");
    expect(text).toContain(
      "--dotaf-color-primary: #16a34a (dark: oklch(from #16a34a max(l, 0.7) c h)) - Brand color",
    );
    expect(text).toContain("--dotaf-space-4: calc(var(--dotaf-space-unit) * 4) - 4 spacing units");
  });

  test("list_components names each component, what it is for, and whether the project has it", async () => {
    const root = await project({ "src/ui/button.tsx": "", "src/ui/button.module.css": "" });

    const { text } = await call(root, "list_components");

    expect(text).toContain("- button: Triggers an action");
    expect(text).toContain("In the project: src/ui/button.tsx, src/ui/button.module.css");
    expect(text).toMatch(/- checkbox: .*\n {2}Not in the project yet\./);
  });

  test("get_component for a component the project lacks shows its API, source and how to add it", async () => {
    const { text } = await call(await project(), "get_component", { name: "button" });

    expect(text).toContain("# button");
    expect(text).toContain('- variant: "primary" | "secondary" | "ghost" | "danger" = "primary"');
    expect(text).toContain('<Button variant="primary" onPress={save}>Save changes</Button>');
    expect(text).toContain("npx dotaf add button");
    expect(text).toContain('```tsx\n"use client";');
    expect(text).toContain("```css\n.root {");
  });

  test("get_component for an installed component points at the project's own copy", async () => {
    const root = await project({ "src/ui/button.tsx": "", "src/ui/button.module.css": "" });

    const { text } = await call(root, "get_component", { name: "button" });

    expect(text).toContain("In the project: src/ui/button.tsx, src/ui/button.module.css");
    expect(text).not.toContain("npx dotaf add");
    expect(text).not.toContain("```tsx");
  });

  test("get_component gives the project's own install command for packages it lacks", async () => {
    const lacking = await call(await project(), "get_component", { name: "button" });
    expect(lacking.text).toContain(
      "The project lacks npm packages it imports: pnpm add react-aria-components",
    );

    const ready = await project({
      "package.json": JSON.stringify({ dependencies: { "react-aria-components": "^1.0.0" } }),
    });
    const { text } = await call(ready, "get_component", { name: "button" });
    expect(text).not.toContain("lacks npm packages");
  });

  test("an unknown component is an error that lists the real ones", async () => {
    const { text, isError } = await call(await project(), "get_component", { name: "dialogg" });

    expect(isError).toBe(true);
    expect(text).toContain("Available: button");
  });

  test("without dotaf.json every tool tells the agent to run init", async () => {
    const root = await folder({ "package.json": "{}" });

    for (const [name, args] of [
      ["get_design_system", {}],
      ["list_components", {}],
      ["get_component", { name: "button" }],
    ] as const) {
      const { text, isError } = await call(root, name, args);
      expect(isError).toBe(true);
      expect(text).toContain("npx dotaf init");
    }
  });
});
