import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import {
  configFileName,
  DotafConfigError,
  parseConfig,
  type ResolvedConfig,
} from "../config/config.js";
import { generateCss } from "../config/generate-css.js";
import { parseJson } from "../config/json.js";

/** Writes dotaf.json as dotaf formats it: two-space JSON and a final newline. */
export async function writeConfig(root: string, config: unknown): Promise<void> {
  await writeFile(join(root, configFileName), `${JSON.stringify(config, null, 2)}\n`);
}

/** Writes dotaf.css for `config` at its paths.css. */
export async function writeStylesheet(root: string, config: ResolvedConfig): Promise<void> {
  const file = join(root, config.paths.css);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, generateCss(config));
}

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
    input = parseJson(source);
  } catch (error) {
    throw new DotafConfigError(`${path} is not valid JSON:`, [
      error instanceof Error ? error.message : String(error),
    ]);
  }

  return parseConfig(input, path);
}
