import { mkdir, stat, writeFile } from "node:fs/promises";
import { dirname, join, posix } from "node:path";
import {
  getComponent,
  listComponents,
  RegistryError,
  type RegistryComponent,
} from "@dotaf/registry";

import { DotafConfigError } from "./config.js";
import { configFileName, loadConfig } from "./load-config.js";
import { exists, installCommand, readProject } from "./project.js";

export interface AddedComponent {
  name: string;
  /** Project-relative paths of the files written. */
  files: string[];
  /** Set when the component came in because another one imports it. */
  neededBy?: string;
}

export interface KeptComponent {
  name: string;
  /** Its files already in the project, left as they are. */
  existing: string[];
  /** Its files not in the project; the existing ones may import them. */
  missing: string[];
  neededBy?: string;
}

export interface AddResult {
  added: AddedComponent[];
  /** Components left alone because one of their files already exists. */
  kept: KeptComponent[];
  /** Installs the npm packages the components import, if any are missing. */
  install?: string;
}

/** A component to copy, and which component pulled it in, if the caller didn't name it. */
interface Wanted {
  component: RegistryComponent;
  /** Set when another component pulled this one in rather than the caller naming it. */
  neededBy?: string;
}

// add may run from a subfolder; the project is where dotaf.json is.
async function projectRoot(cwd: string): Promise<string> {
  for (let dir = cwd; ; dir = dirname(dir)) {
    if (await exists(join(dir, configFileName))) return dir;
    if (dirname(dir) === dir) {
      throw new DotafConfigError(
        `No ${configFileName} in ${cwd} or above it. Run \`npx dotaf init\` in your project's root.`,
      );
    }
  }
}

/** The named components, then what they import, each once, in that order. */
async function resolve(names: string[], registry: string | undefined): Promise<Wanted[]> {
  const available = new Set((await listComponents(registry)).map((meta) => meta.name));
  const unknown = [...new Set(names)].filter((name) => !available.has(name));
  if (unknown.length > 0) {
    throw new RegistryError(
      `No component named ${unknown.map((name) => `"${name}"`).join(", ")}. Available: ${[...available].join(", ")}`,
    );
  }

  const queue: { name: string; neededBy?: string }[] = names.map((name) => ({ name }));
  const wanted: Wanted[] = [];
  const seen = new Set<string>();
  for (let next = queue.shift(); next !== undefined; next = queue.shift()) {
    if (seen.has(next.name)) continue;
    seen.add(next.name);
    if (!available.has(next.name)) {
      throw new RegistryError(
        `${next.neededBy ?? next.name} needs "${next.name}", which the registry does not have`,
      );
    }
    const component = await getComponent(next.name, registry);
    wanted.push(
      next.neededBy === undefined ? { component } : { component, neededBy: next.neededBy },
    );
    for (const dependency of component.meta.registryDependencies) {
      queue.push({ name: dependency, neededBy: next.name });
    }
  }
  return wanted;
}

/**
 * Copies registry components into the project's paths.components, side by side, together
 * with the components they import. A component with a file already in place is kept whole,
 * never half-written; `overwrite` replaces only the components named, never one that was
 * pulled in for another. `registry` points at another registry folder (tests use it).
 */
export async function addComponents(
  cwd: string,
  names: string[],
  options: { overwrite?: boolean | undefined; registry?: string | undefined } = {},
): Promise<AddResult> {
  const root = await projectRoot(cwd);
  const config = await loadConfig(root);
  const wanted = await resolve(names, options.registry);

  const folder = join(root, config.paths.components);
  const folderStat = await stat(folder).catch(() => undefined);
  if (folderStat !== undefined && !folderStat.isDirectory()) {
    throw new DotafConfigError(
      `paths.components in ${configFileName} is ${config.paths.components}, which is not a folder.`,
    );
  }

  const added: AddedComponent[] = [];
  const kept: KeptComponent[] = [];
  for (const { component, neededBy } of wanted) {
    const targets = component.files.map((file) => ({
      ...file,
      path: posix.join(config.paths.components, file.path),
    }));
    const present = await Promise.all(targets.map((target) => exists(join(root, target.path))));
    const existing = targets.filter((_, index) => present[index] === true).map((t) => t.path);
    const owner = neededBy === undefined ? {} : { neededBy };
    if (existing.length > 0 && (options.overwrite !== true || neededBy !== undefined)) {
      const missing = targets
        .map((target) => target.path)
        .filter((path) => !existing.includes(path));
      kept.push({ name: component.meta.name, existing, missing, ...owner });
      continue;
    }
    await mkdir(folder, { recursive: true });
    for (const target of targets) await writeFile(join(root, target.path), target.content);
    added.push({ name: component.meta.name, files: targets.map((t) => t.path), ...owner });
  }

  const install = installCommand(
    await readProject(root),
    wanted.flatMap(({ component }) => component.meta.dependencies),
  );
  return { added, kept, ...(install === undefined ? {} : { install }) };
}
