import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

import { lintProject } from "../index.js";

const folders: string[] = [];

async function folder(files: Record<string, string>): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "dotaf-lint-"));
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

function project(files: Record<string, string> = {}) {
  return folder({
    "package.json": "{}",
    "dotaf.json": JSON.stringify({ paths: { components: "src/ui", css: "src/dotaf.css" } }),
    ...files,
  });
}

const raw = ".card {\n  padding: 12px;\n  color: #ff0000;\n}\n";
const clean = ".card {\n  padding: var(--dotaf-space-3);\n}\n";

describe("lintProject", () => {
  test("names each raw value by file, line and column, with the token to use instead", async () => {
    const root = await project({ "src/ui/card.module.css": raw });

    const { findings } = await lintProject(root);

    expect(findings).toEqual([
      {
        file: "src/ui/card.module.css",
        line: 2,
        column: 12,
        rule: "dotaf/use-tokens",
        message: "Use var(--dotaf-space-3) instead of 12px",
      },
      {
        file: "src/ui/card.module.css",
        line: 3,
        column: 10,
        rule: "dotaf/use-tokens",
        message: "Use var(--dotaf-color-fg) or var(--dotaf-color-muted-fg) instead of #ff0000",
      },
    ]);
  });

  test("lists the files it checked, so a clean result is visibly not an empty one", async () => {
    const root = await project({ "src/a.css": clean, "src/ui/b.module.css": clean });

    expect(await lintProject(root)).toEqual({
      files: ["src/a.css", "src/ui/b.module.css"],
      findings: [],
    });
  });

  test("skips the generated dotaf.css, installed packages and build output", async () => {
    const root = await project({
      "src/dotaf.css": raw,
      "node_modules/pkg/style.css": raw,
      "dist/app.css": raw,
      "build/app.css": raw,
      "out/app.css": raw,
      "coverage/report.css": raw,
      "src/a.css": clean,
    });

    expect(await lintProject(root)).toEqual({ files: ["src/a.css"], findings: [] });
  });

  test("checks only the files named, absolute or relative to the project", async () => {
    const root = await project({ "src/a.css": raw, "src/b.css": raw, "src/c.css": raw });

    const { files } = await lintProject(root, ["src/a.css", join(root, "src/b.css")]);

    expect(files).toEqual(["src/a.css", "src/b.css"]);
  });

  test("a named file that is missing or not CSS is an error, not a clean result", async () => {
    const root = await project({ "src/a.css": clean, "src/page.tsx": "" });

    await expect(lintProject(root, ["src/nope.css"])).rejects.toThrow(
      "src/nope.css does not exist.",
    );
    await expect(lintProject(root, ["src/page.tsx"])).rejects.toThrow(
      "src/page.tsx is not a CSS file.",
    );
  });

  test("uses dotaf's rule, not whatever stylelint config the project has", async () => {
    const root = await project({
      ".stylelintrc.json": JSON.stringify({ rules: { "color-no-invalid-hex": true } }),
      "src/a.css": raw,
    });

    const { findings } = await lintProject(root);

    expect(findings.map((finding) => finding.rule)).toEqual([
      "dotaf/use-tokens",
      "dotaf/use-tokens",
    ]);
  });

  test("works from a subfolder, and a project without CSS is simply clean", async () => {
    const root = await project({ "src/app/page.tsx": "" });

    expect(await lintProject(join(root, "src/app"))).toEqual({ files: [], findings: [] });
  });
});
