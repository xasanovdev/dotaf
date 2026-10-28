import { access, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { configFileName } from "./load-config.js";

export type Framework = "next" | "vite" | "unknown";
export type PackageManager = "pnpm" | "yarn" | "bun" | "npm";

export interface ProjectInfo {
  framework: Framework;
  packageManager: PackageManager;
  /** The file that should import dotaf.css once, relative to the project, if one was found. */
  entry: string | undefined;
  hasConfig: boolean;
}

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

export async function exists(path: string): Promise<boolean> {
  return access(path).then(
    () => true,
    () => false,
  );
}

/** JSON as editors save it, byte order mark included. */
export function parseJson(text: string): unknown {
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

export interface Project {
  info: ProjectInfo;
  hasPackageJson: boolean;
  /** Names in dependencies and devDependencies. */
  dependencies: ReadonlySet<string>;
}

/** Everything init and add need to know about a project, read once. */
export async function readProject(cwd: string): Promise<Project> {
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
  return (await readProject(cwd)).info;
}

/** The command that installs whichever of `packages` the project lacks; undefined if none. */
export function installCommand(project: Project, packages: Iterable<string>): string | undefined {
  const missing = [...new Set(packages)].filter((name) => !project.dependencies.has(name));
  return missing.length === 0
    ? undefined
    : `${managers[project.info.packageManager].add} ${missing.join(" ")}`;
}
