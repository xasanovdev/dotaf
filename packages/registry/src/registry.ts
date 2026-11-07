import { access, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

/** The components/ folder this package ships; resolves the same from src/ and dist/. */
export const packageComponents = fileURLToPath(new URL("../components", import.meta.url));

export class RegistryError extends Error {
  override name = "RegistryError";

  constructor(
    summary: string,
    readonly issues: readonly string[] = [],
  ) {
    super([summary, ...issues.map((issue) => `  - ${issue}`)].join("\n"));
  }
}

/**
 * Source files of a component, relative to the registry root, in the order they are copied
 * into a project. Each component has its own folder; its demo and tests sit there too but are
 * not copied. index.ts re-exports the source, so a project imports the folder
 * ("@/components/ui/button") instead of naming it twice.
 */
export function componentFiles(name: string): string[] {
  return [`${name}/${name}.tsx`, `${name}/${name}.module.css`, `${name}/index.ts`];
}

function metaFile(name: string): string {
  return `${name}/${name}.json`;
}

const propSchema = z.strictObject({
  name: z.string().min(1),
  type: z.string().min(1),
  description: z.string().min(1),
  default: z.string().optional(),
  required: z.boolean().default(false),
});

const metaSchema = z.strictObject({
  name: z.string().regex(/^[a-z][a-z0-9-]*$/, { error: "must be kebab-case, e.g. text-field" }),
  /** One or two sentences an agent reads to decide whether this component fits. */
  description: z.string().min(1),
  /** npm packages the component imports, installed into the user's project. */
  dependencies: z.array(z.string()).default([]),
  /** Other registry components it imports as "../<name>", copied alongside it. */
  registryDependencies: z.array(z.string()).default([]),
  props: z.array(propSchema).default([]),
  /** A minimal JSX usage an agent can adapt. */
  example: z.string().min(1),
});

export type ComponentMeta = z.output<typeof metaSchema>;

export interface ComponentFile {
  /** Path from the registry root, e.g. `button/button.module.css`. */
  path: string;
  content: string;
}

export interface RegistryComponent {
  meta: ComponentMeta;
  files: ComponentFile[];
}

// Each folder is a component, named like the folder. Dot folders hold tool state.
async function componentNames(root: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort();
}

async function readMeta(root: string, name: string): Promise<ComponentMeta> {
  const path = metaFile(name);
  const text = await readFile(join(root, path), "utf8");

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (error) {
    throw new RegistryError(`${path} is invalid:`, [`not valid JSON: ${(error as Error).message}`]);
  }

  const result = metaSchema.safeParse(json);
  if (!result.success) {
    throw new RegistryError(
      `${path} is invalid:`,
      result.error.issues.map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`),
    );
  }
  if (result.data.name !== name) {
    throw new RegistryError(`${path} is invalid:`, [`name: must match its folder name "${name}"`]);
  }
  return result.data;
}

// A listed component must be copyable, so its files are checked up front. A broken meta
// is reported before missing sources, since it says what the component should be.
async function readCompleteMeta(root: string, name: string): Promise<ComponentMeta> {
  const missing: string[] = [];
  for (const file of [metaFile(name), ...componentFiles(name)]) {
    await access(join(root, file)).catch(() => missing.push(file));
  }
  const fail = () => new RegistryError(`${name} is missing ${missing.join(", ")}`);
  if (missing.includes(metaFile(name))) throw fail();
  const meta = await readMeta(root, name);
  if (missing.length > 0) throw fail();
  return meta;
}

/** Every component's meta, sorted by name. `root` defaults to the components this package ships. */
export async function listComponents(root = packageComponents): Promise<ComponentMeta[]> {
  const names = await componentNames(root);
  return Promise.all(names.map((name) => readCompleteMeta(root, name)));
}

/** A component's meta and the source files to copy into a project. */
export async function getComponent(
  name: string,
  root = packageComponents,
): Promise<RegistryComponent> {
  const names = await componentNames(root);
  if (!names.includes(name)) {
    throw new RegistryError(
      `No component named "${name}". Available: ${names.join(", ") || "(none)"}`,
    );
  }
  const meta = await readCompleteMeta(root, name);
  const files = await Promise.all(
    componentFiles(name).map(async (path) => ({
      path,
      content: await readFile(join(root, path), "utf8"),
    })),
  );
  return { meta, files };
}
