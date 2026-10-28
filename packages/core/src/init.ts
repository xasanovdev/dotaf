import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, posix, relative, resolve, sep } from "node:path";

import { DotafConfigError, parseConfig, type DotafConfig } from "./config.js";
import { generateCss } from "./generate-css.js";
import { configFileName, loadConfig } from "./load-config.js";
import { exists, installCommand, parseJson, readProject, type ProjectInfo } from "./project.js";

export interface InitResult {
  /** False on a rerun: an existing dotaf.json is left as it is. */
  wroteConfig: boolean;
  /** Where dotaf.css was written, relative to the project. */
  css: string;
  /** The import to add once; init never edits project code itself. Absent once it's there. */
  importInto?: { file: string; statement: string };
  /** Installs the components' peer dependency, unless the project already has it. */
  install?: string;
  connectAgent: string;
}

/** A theme was offered while dotaf.json exists; replacing it must be asked for explicitly. */
export class DotafConfigExistsError extends DotafConfigError {
  override name = "DotafConfigExistsError";
}

const schemaUrl = "https://unpkg.com/@dotaf/core/dotaf.schema.json";

// Next.js app router keeps global CSS beside the root layout; everything else uses styles/.
async function defaultPaths(
  cwd: string,
  info: ProjectInfo,
): Promise<{ css: string; components: string }> {
  const base =
    info.entry?.startsWith("src/") === true || (await exists(join(cwd, "src"))) ? "src/" : "";
  const css =
    info.framework === "next" && info.entry?.includes("app/layout") === true
      ? posix.join(posix.dirname(info.entry), "dotaf.css")
      : `${base}styles/dotaf.css`;
  return { css, components: `${base}components/ui` };
}

function importSpecifier(entry: string, css: string): string {
  const path = relative(dirname(entry), css).split(sep).join("/");
  return path.startsWith(".") ? path : `./${path}`;
}

/**
 * Sets a project up: writes dotaf.json unless one exists, then dotaf.css from it. The brand
 * comes from `theme` (a file or URL), else from `askBrand` on a first run, else defaults.
 * A rerun keeps dotaf.json; a theme replaces it only with `force`. Resolves undefined when
 * `askBrand` was cancelled, having written nothing.
 */
export async function initProject(
  cwd: string,
  options: {
    theme?: string | undefined;
    askBrand?: (() => Promise<DotafConfig | undefined>) | undefined;
    force?: boolean | undefined;
  },
): Promise<InitResult | undefined> {
  const project = await readProject(cwd);
  const { info, hasPackageJson } = project;
  if (!hasPackageJson) {
    throw new DotafConfigError(`No package.json in ${cwd}. Run dotaf init in your project's root.`);
  }
  if (info.hasConfig && options.theme !== undefined && options.force !== true) {
    throw new DotafConfigExistsError(
      `${configFileName} already exists in ${cwd}; replacing it with a theme must be forced.`,
    );
  }

  let brand: DotafConfig | undefined;
  if (options.theme !== undefined) {
    brand = await readTheme(options.theme, cwd);
  } else if (!info.hasConfig && options.askBrand !== undefined) {
    brand = await options.askBrand();
    if (brand === undefined) return undefined;
  }

  const writeConfig = !info.hasConfig || options.theme !== undefined;
  if (writeConfig) {
    const input: DotafConfig = {
      ...brand,
      $schema: schemaUrl,
      paths: await defaultPaths(cwd, info),
    };
    parseConfig(input, configFileName);
    await writeFile(join(cwd, configFileName), `${JSON.stringify(input, null, 2)}\n`);
  }

  const config = await loadConfig(cwd);
  const cssFile = join(cwd, config.paths.css);
  await mkdir(dirname(cssFile), { recursive: true });
  await writeFile(cssFile, generateCss(config));

  const specifier =
    info.entry === undefined ? undefined : importSpecifier(info.entry, config.paths.css);
  const imported =
    info.entry !== undefined &&
    specifier !== undefined &&
    (await readFile(join(cwd, info.entry), "utf8")).includes(specifier);
  const install = installCommand(project, ["react-aria-components"]);
  return {
    wroteConfig: writeConfig,
    css: config.paths.css,
    ...(info.entry === undefined || specifier === undefined || imported
      ? {}
      : { importInto: { file: info.entry, statement: `import "${specifier}";` } }),
    ...(install === undefined ? {} : { install }),
    connectAgent: "claude mcp add dotaf -- npx dotaf mcp",
  };
}

async function download(url: string): Promise<string> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    const cause = error instanceof Error && error.cause instanceof Error ? error.cause : error;
    throw new DotafConfigError(
      `Could not download ${url}: ${cause instanceof Error ? cause.message : String(cause)}`,
    );
  }
  if (!response.ok) {
    throw new DotafConfigError(`Could not download ${url}: HTTP ${String(response.status)}`);
  }
  return response.text();
}

async function readLocal(path: string): Promise<string> {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    const code = error instanceof Error && "code" in error ? error.code : undefined;
    throw new DotafConfigError(
      code === "ENOENT" ? `No theme file at ${path}` : `Could not read the theme at ${path}`,
    );
  }
}

/**
 * A theme (a dotaf.json someone shared) from a file path or an http(s) URL, validated. A
 * theme is a brand: its paths and $schema are dropped, so it can never choose where files go.
 */
export async function readTheme(source: string, cwd: string): Promise<DotafConfig> {
  const text = /^https?:\/\//.test(source)
    ? await download(source)
    : await readLocal(resolve(cwd, source));

  let theme: unknown;
  try {
    theme = parseJson(text);
  } catch (error) {
    throw new DotafConfigError(`${source} is not valid JSON:`, [
      error instanceof Error ? error.message : String(error),
    ]);
  }
  if (typeof theme !== "object" || theme === null || Array.isArray(theme)) {
    throw new DotafConfigError(`${source} is not a dotaf.json object`);
  }
  const brand = Object.fromEntries(
    Object.entries(theme).filter(([key]) => key !== "paths" && key !== "$schema"),
  );
  parseConfig(brand, source);
  return brand;
}
