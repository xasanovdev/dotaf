import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, posix, relative, resolve, sep } from "node:path";
import { DotafConfigError, parseConfig, type DotafConfig } from "./config.js";
import { generateCss } from "./generate-css.js";
import { configFileName, loadConfig } from "./load-config.js";

export type Framework = "next" | "vite" | "unknown";
export type PackageManager = "pnpm" | "yarn" | "bun" | "npm";

export interface ProjectInfo {
  framework: Framework;
  packageManager: PackageManager;
  /** The file that should import dotaf.css once, relative to the project, if one was found. */
  entry: string | undefined;
  hasConfig: boolean;
}

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

// Root layouts first: in the app router they are where global CSS belongs.
const entryCandidates: Record<Framework, string[]> = {
  next: ["src/app", "app", "src/pages", "pages"].flatMap((dir) =>
    ["tsx", "jsx", "js"].map((ext) => `${dir}/${dir.endsWith("pages") ? "_app" : "layout"}.${ext}`),
  ),
  vite: ["tsx", "jsx", "ts", "js"].map((ext) => `src/main.${ext}`),
  unknown: [],
};

const managers: Record<PackageManager, { lockfiles: string[]; add: string }> = {
  pnpm: { lockfiles: ["pnpm-lock.yaml"], add: "pnpm add" },
  yarn: { lockfiles: ["yarn.lock"], add: "yarn add" },
  bun: { lockfiles: ["bun.lock", "bun.lockb"], add: "bun add" },
  npm: { lockfiles: ["package-lock.json"], add: "npm install" },
};

async function exists(path: string): Promise<boolean> {
  return access(path).then(
    () => true,
    () => false,
  );
}

/** JSON as editors save it, byte order mark included. */
function parseJson(text: string): unknown {
  return JSON.parse(text.replace(/^\uFEFF/, ""));
}

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  packageManager?: string;
}

// An app inside a monorepo has its lockfile at the workspace root, so the search walks up.
async function packageManagerOf(
  cwd: string,
  declared: string | undefined,
): Promise<PackageManager> {
  const all = Object.entries(managers) as [PackageManager, (typeof managers)[PackageManager]][];
  const named = all.find(([name]) => declared?.startsWith(`${name}@`));
  if (named !== undefined) return named[0];
  for (let dir = resolve(cwd); ; dir = dirname(dir)) {
    for (const [name, { lockfiles }] of all) {
      for (const file of lockfiles) {
        if (await exists(join(dir, file))) return name;
      }
    }
    if (dirname(dir) === dir) return "npm";
  }
}

/** Everything init needs to know about a project, read once. */
async function inspect(cwd: string) {
  const path = join(cwd, "package.json");
  const pkg = (await exists(path))
    ? (parseJson(await readFile(path, "utf8")) as PackageJson)
    : undefined;
  const dependencies = new Set([
    ...Object.keys(pkg?.dependencies ?? {}),
    ...Object.keys(pkg?.devDependencies ?? {}),
  ]);
  const framework: Framework = dependencies.has("next")
    ? "next"
    : dependencies.has("vite")
      ? "vite"
      : "unknown";
  let entry: string | undefined;
  for (const candidate of entryCandidates[framework]) {
    if (await exists(join(cwd, candidate))) {
      entry = candidate;
      break;
    }
  }
  const info: ProjectInfo = {
    framework,
    packageManager: await packageManagerOf(cwd, pkg?.packageManager),
    entry,
    hasConfig: await exists(join(cwd, configFileName)),
  };
  return { info, hasPackageJson: pkg !== undefined, dependencies };
}

export async function detectProject(cwd: string): Promise<ProjectInfo> {
  return (await inspect(cwd)).info;
}

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
  const { info, hasPackageJson, dependencies } = await inspect(cwd);
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
  return {
    wroteConfig: writeConfig,
    css: config.paths.css,
    ...(info.entry === undefined || specifier === undefined || imported
      ? {}
      : { importInto: { file: info.entry, statement: `import "${specifier}";` } }),
    ...(dependencies.has("react-aria-components")
      ? {}
      : { install: `${managers[info.packageManager].add} react-aria-components` }),
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
