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

/** Source files of a component, in the order they are copied into a project. */
export function componentFiles(name: string): string[] {
  return [`${name}.tsx`, `${name}.module.css`];
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
  props: z.array(propSchema).default([]),
  /** A minimal JSX usage an agent can adapt. */
  example: z.string().min(1),
});

export type ComponentMeta = z.output<typeof metaSchema>;

export interface ComponentFile {
  /** File name relative to the component folder, e.g. `button.module.css`. */
  path: string;
  content: string;
}

export interface RegistryComponent {
  meta: ComponentMeta;
  files: ComponentFile[];
}

// Dot folders hold editor or tool state, never components.
async function componentNames(root: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort();
}

async function readMeta(root: string, name: string): Promise<ComponentMeta> {
  const path = join(name, "meta.json");
  let text: string;
  try {
    text = await readFile(join(root, path), "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new RegistryError(`${name} is missing meta.json`);
    }
    throw error;
  }

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
    throw new RegistryError(`${path} is invalid:`, [`name: must match its folder "${name}"`]);
  }
  return result.data;
}

// A listed component must be copyable, so its source files are checked up front.
async function readCompleteMeta(root: string, name: string): Promise<ComponentMeta> {
  const meta = await readMeta(root, name);
  const missing: string[] = [];
  for (const file of componentFiles(name)) {
    await access(join(root, name, file)).catch(() => missing.push(file));
  }
  if (missing.length > 0) {
    throw new RegistryError(`${name} is missing ${missing.join(", ")}`);
  }
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
      content: await readFile(join(root, name, path), "utf8"),
    })),
  );
  return { meta, files };
}
