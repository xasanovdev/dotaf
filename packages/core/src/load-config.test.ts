import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { DotafConfigError, loadConfig } from "./index.js";

let project: string;

beforeEach(async () => {
  project = await mkdtemp(join(tmpdir(), "dotaf-"));
});

afterEach(async () => {
  await rm(project, { recursive: true, force: true });
});

describe("loadConfig", () => {
  test("reads and resolves dotaf.json from the project directory", async () => {
    await writeFile(join(project, "dotaf.json"), JSON.stringify({ radius: "full" }));

    const config = await loadConfig(project);

    expect(config.radius).toBe("full");
  });

  test("a project without dotaf.json gets told how to create one", async () => {
    const load = loadConfig(project);

    await expect(load).rejects.toThrow(DotafConfigError);
    await expect(load).rejects.toThrow(/npx dotaf init/);
  });

  test("an invalid value names both the file and the field", async () => {
    await writeFile(join(project, "dotaf.json"), JSON.stringify({ radius: "huge" }));

    const load = loadConfig(project);

    await expect(load).rejects.toThrow(join(project, "dotaf.json"));
    await expect(load).rejects.toThrow(/radius/);
  });

  test("malformed JSON is reported as a dotaf.json problem", async () => {
    await writeFile(join(project, "dotaf.json"), '{ "radius": "lg", }');

    const load = loadConfig(project);

    await expect(load).rejects.toThrow(DotafConfigError);
    await expect(load).rejects.toThrow(/dotaf\.json is not valid JSON/);
  });
});
