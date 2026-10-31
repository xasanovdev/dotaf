import { extname, resolve } from "node:path";
import {
  addComponents,
  brandDefaults,
  densities,
  describeComponent,
  describeDesignSystem,
  DotafProjectNotFoundError,
  lintProject,
  listProjectComponents,
  radii,
  updateTheme,
  type AddResult,
  type ComponentDetails,
  type ComponentSummary,
  type DesignSystem,
  type LintReport,
  type ThemeUpdate,
} from "@dotaf/core";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

export interface ServerOptions {
  /** Where the client started the server; a tool's path is resolved against it. */
  cwd: string;
  version: string;
}

const instructions = `This project's UI is built on dotaf, a design system kept in dotaf.json.
Before writing or changing UI, call get_design_system and use its tokens and rules.
Before building a control, call list_components; use get_component for the API of the one that fits, and add_component when the project lacks it.
To change the brand (colors, fonts, radius, density), call update_theme rather than editing CSS.
After writing CSS, call lint_ui and fix what it reports.
In a monorepo, pass path: the app folder or file you are working in, so the right dotaf.json is used.`;

// Reading tools; agents may call them freely.
const readOnlyTool = { readOnlyHint: true, openWorldHint: false } as const;
// Writing tools add files or change values and never delete any; repeating a call changes nothing.
const writingTool = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;

/** How an unset dark accent reads, e.g. "derived from colors.primary" for `dark.primary`. */
function derived(field: string): string {
  return `derived from colors.${field.slice(field.indexOf(".") + 1)}`;
}

// Built from core's list of brand fields, so the schema can't drift from dotaf.json.
const brand = brandDefaults();

/** A brand field; null puts it back to dotaf's default. */
function brandField<T extends z.ZodType>(schema: T, field: string, about = "") {
  return schema
    .nullable()
    .optional()
    .describe(`${about}dotaf's default: ${brand.get(field) ?? derived(field)}. null puts it back.`);
}

function brandGroup(group: string, about: string) {
  const fields = [...brand.keys()].filter((field) => field.startsWith(`${group}.`));
  return z
    .strictObject(
      Object.fromEntries(
        fields.map((field) => [field.slice(group.length + 1), brandField(z.string(), field)]),
      ),
    )
    .optional()
    .describe(about);
}

const themeInput = {
  colors: brandGroup("colors", "Light mode colors, as hex or a CSS color function."),
  dark: brandGroup(
    "dark",
    "Dark mode colors. An accent left unset is derived from its light color.",
  ),
  font: brandGroup("font", 'Font stacks, e.g. "Inter, system-ui, sans-serif".'),
  radius: brandField(z.enum(radii), "radius", "Corner rounding. "),
  density: brandField(z.enum(densities), "density", "Spacing scale. "),
};

function textResult(body: string) {
  return { content: [{ type: "text" as const, text: body }] };
}

// Core's message suits a person, who can cd into a folder; an agent passes it as path instead.
async function withPathHint<T>(work: Promise<T>): Promise<T> {
  try {
    return await work;
  } catch (error) {
    if (error instanceof DotafProjectNotFoundError && error.found.length > 0) {
      throw new Error(`${error.message} Call again with path set to one of them.`);
    }
    throw error;
  }
}

/** A dotaf MCP server, not yet connected to a transport. */
export function createServer({ cwd, version }: ServerOptions): McpServer {
  const server = new McpServer({ name: "dotaf", version }, { instructions });
  // Clients start the server wherever they like (Claude Code uses the git root), so the agent
  // says where it is working and dotaf.json is looked up from there.
  const pathInput = z
    .string()
    .optional()
    .describe(
      `The folder or file you are working in. An absolute path is safest; a relative one is read from ${cwd}. Omit it when that folder or one above it holds dotaf.json.`,
    );
  const from = (path: string | undefined) => resolve(cwd, path ?? ".");

  server.registerTool(
    "get_design_system",
    {
      title: "Get the design system",
      description:
        "Call before writing or changing any UI in this project: components, pages or CSS. Returns the rules UI code must follow and every design token (a CSS variable) with what it is for and its light and dark values. Use these tokens instead of raw colors, sizes, fonts or shadows.",
      inputSchema: { path: pathInput },
      annotations: readOnlyTool,
    },
    async (args) =>
      textResult(formatDesignSystem(await withPathHint(describeDesignSystem(from(args.path))))),
  );

  server.registerTool(
    "list_components",
    {
      title: "List components",
      description:
        "Call when the UI needs a control or container (button, text field, checkbox, switch, card...) before building one by hand. Lists the dotaf components, what each is for, and whether this project already has it.",
      inputSchema: { path: pathInput },
      annotations: readOnlyTool,
    },
    async (args) =>
      textResult(formatComponents(await withPathHint(listProjectComponents(from(args.path))))),
  );

  server.registerTool(
    "get_component",
    {
      title: "Get a component",
      description:
        "Call before using or adapting a dotaf component. Returns its props, a usage example and the install command for npm packages the project lacks; then either where the project keeps it, or its source, which add_component copies in.",
      inputSchema: {
        name: z.string().describe('Component name from list_components, e.g. "text-field".'),
        path: pathInput,
      },
      annotations: readOnlyTool,
    },
    async (args) =>
      textResult(
        formatComponent(await withPathHint(describeComponent(from(args.path), args.name))),
      ),
  );

  server.registerTool(
    "add_component",
    {
      title: "Add components",
      description:
        "Call when list_components shows that a component the UI needs is not in the project yet. Copies it, with the components it uses, into the project's components folder; a file that already exists is never overwritten. Returns the files written and the install command for npm packages the project lacks, which you then run.",
      inputSchema: {
        names: z
          .array(z.string())
          .min(1)
          .describe('Component names from list_components, e.g. ["card", "switch"].'),
        path: pathInput,
      },
      annotations: writingTool,
    },
    async (args) =>
      textResult(formatAdded(await withPathHint(addComponents(from(args.path), args.names)))),
  );

  server.registerTool(
    "update_theme",
    {
      title: "Update the theme",
      description:
        "Call when the user asks to change the brand: colors, dark mode colors, fonts, corner radius or density (e.g. \"make the primary greener\"). Pass only the fields to change, as exact values; the defaults in this schema are dotaf's, not the project's, so read the current values with get_design_system first. Updates dotaf.json and regenerates dotaf.css at once, so every token and component follows. Returns each change, before and after.",
      inputSchema: { ...themeInput, path: pathInput },
      annotations: writingTool,
    },
    async ({ path, ...changes }) =>
      textResult(formatTheme(await withPathHint(updateTheme(from(path), changes)))),
  );

  server.registerTool(
    "lint_ui",
    {
      title: "Lint UI styles",
      description:
        "Call after writing or changing CSS, before calling the work done. Checks the project's CSS for raw colors, sizes, fonts, shadows and timings that should be dotaf tokens, and returns each as file:line:column with the token to use instead.",
      inputSchema: {
        files: z
          .array(z.string())
          .optional()
          .describe(
            "CSS files to check, absolute or relative to the project (the folder with dotaf.json). Omit to check all of them.",
          ),
        path: pathInput,
      },
      annotations: readOnlyTool,
    },
    async (args) =>
      textResult(formatLint(await withPathHint(lintProject(from(args.path), args.files)))),
  );

  return server;
}

/** Connects a server to stdio; the process keeps serving while stdin stays open. */
export async function serve(options: ServerOptions): Promise<void> {
  await createServer(options).connect(new StdioServerTransport());
}

function formatDesignSystem({ rules, tokens, paths }: DesignSystem): string {
  return [
    `Tokens are generated into ${paths.css}; components live in ${paths.components}.`,
    "",
    "Rules",
    ...rules.map((rule) => `- ${rule}`),
    "",
    "Tokens (write as var(--dotaf-...))",
    ...tokens.map(
      ({ name, value, dark, description }) =>
        `${name}: ${value}${dark === undefined ? "" : ` (dark: ${dark})`} - ${description}`,
    ),
  ].join("\n");
}

function whereInstalled(installed: string[]): string | undefined {
  return installed.length === 0 ? undefined : `In the project: ${installed.join(", ")}`;
}

function formatComponents(components: ComponentSummary[]): string {
  return [
    "dotaf components. Call get_component for the props, an example and the source.",
    "",
    ...components.flatMap(({ name, description, installed }) => [
      `- ${name}: ${description}`,
      `  ${whereInstalled(installed) ?? "Not in the project yet."}`,
    ]),
  ].join("\n");
}

function formatComponent({ meta, files, installed, install }: ComponentDetails): string {
  const where = whereInstalled(installed);
  return [
    `# ${meta.name}`,
    meta.description,
    "",
    "Props",
    ...meta.props.map(
      (prop) =>
        `- ${prop.name}${prop.required ? " (required)" : ""}: ${prop.type}${prop.default === undefined ? "" : ` = ${prop.default}`} - ${prop.description}`,
    ),
    "",
    "Example",
    meta.example,
    ...(install === undefined ? [] : ["", `The project lacks npm packages it imports: ${install}`]),
    ...(meta.registryDependencies.length === 0
      ? []
      : ["", `Uses components: ${meta.registryDependencies.join(", ")}`]),
    "",
    // The project's copy is its own and may have been edited, so the agent reads that instead.
    ...(where === undefined
      ? [
          "Not in the project yet. Add it with add_component, which copies these files:",
          ...files.flatMap(({ path, content }) => [
            "",
            `## ${path}`,
            // The extension names the fence language: tsx, css.
            `\`\`\`${extname(path).slice(1)}`,
            content.trimEnd(),
            "```",
          ]),
        ]
      : [`${where}. Read those files: they are the project's copy and may differ from dotaf's.`]),
  ].join("\n");
}

function plural(count: number, noun: string): string {
  return `${String(count)} ${noun}${count === 1 ? "" : "s"}`;
}

function formatAdded({ added, kept, install }: AddResult): string {
  const usedBy = (neededBy: string | undefined) =>
    neededBy === undefined ? "" : ` (${neededBy} uses it)`;
  const verb = (files: string[], one: string, many: string) => (files.length === 1 ? one : many);
  return [
    ...added.map(
      ({ name, files, neededBy }) => `Added ${name}${usedBy(neededBy)}: ${files.join(", ")}`,
    ),
    // Missing files are said outright: no tool overwrites a kept component to restore them.
    ...kept.map(
      ({ name, existing, missing, neededBy }) =>
        `Kept ${name}${usedBy(neededBy)}: ${existing.join(", ")} already ${verb(existing, "exists", "exist")}, so the project's version stays.${missing.length === 0 ? "" : ` ${missing.join(", ")} ${verb(missing, "is", "are")} missing.`}`,
    ),
    ...(install === undefined ? [] : ["", `Run: ${install}`]),
  ].join("\n");
}

function formatTheme({ changed, css }: ThemeUpdate): string {
  if (changed.length === 0) return "Nothing changed: the brand already has those values.";
  const shown = (field: string, value: string | undefined) => value ?? derived(field);
  return [
    "Updated dotaf.json:",
    ...changed.map(
      ({ field, from, to }) => `- ${field}: ${shown(field, from)} -> ${shown(field, to)}`,
    ),
    `Regenerated ${css}.`,
  ].join("\n");
}

function formatLint({ files, findings }: LintReport): string {
  if (files.length === 0) return "No CSS files to check.";
  if (findings.length === 0) {
    return `Checked ${plural(files.length, "CSS file")}: every design value is a dotaf token.`;
  }
  const withProblems = new Set(findings.map((finding) => finding.file)).size;
  return [
    ...findings.map(
      ({ file, line, column, message }) => `${file}:${String(line)}:${String(column)} ${message}`,
    ),
    "",
    `${plural(findings.length, "problem")} in ${String(withProblems)} of ${plural(files.length, "CSS file")}.`,
  ].join("\n");
}
