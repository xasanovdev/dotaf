import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DotafConfigError, parseConfig, type ResolvedConfig } from "./config.js";

/** The file a project keeps its brand in, at the project root. */
export const configFileName = "dotaf.json";

export async function loadConfig(cwd: string): Promise<ResolvedConfig> {
  const path = join(cwd, configFileName);

  let source: string;
  try {
    source = await readFile(path, "utf8");
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      throw new DotafConfigError(`No dotaf.json in ${cwd}. Run \`npx dotaf init\` to create one.`);
    }
    throw error;
  }

  let input: unknown;
  try {
    input = JSON.parse(source);
  } catch (error) {
    throw new DotafConfigError(`${path} is not valid JSON:`, [
      error instanceof Error ? error.message : String(error),
    ]);
  }

  return parseConfig(input, path);
}
