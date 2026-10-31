import { extname } from "node:path";
import {
  describeComponent,
  describeDesignSystem,
  listProjectComponents,
  type ComponentDetails,
  type ComponentSummary,
  type DesignSystem,
} from "@dotaf/core";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

export interface ServerOptions {
  /** The project folder, or one inside it; dotaf.json is looked up from here. */
  cwd: string;
  version: string;
}

const instructions = `This project's UI is built on dotaf, a design system kept in dotaf.json.
Before writing or changing UI, call get_design_system and use its tokens and rules.
Before building a control, call list_components; use get_component for the API of the one that fits.`;

// The tools only read the project; agents may call them freely.
const readOnly = { readOnlyHint: true, openWorldHint: false } as const;

function textResult(body: string) {
  return { content: [{ type: "text" as const, text: body }] };
}

/** A dotaf MCP server for one project, not yet connected to a transport. */
export function createServer({ cwd, version }: ServerOptions): McpServer {
  const server = new McpServer({ name: "dotaf", version }, { instructions });

  server.registerTool(
    "get_design_system",
    {
      title: "Get the design system",
      description:
        "Call before writing or changing any UI in this project: components, pages or CSS. Returns the rules UI code must follow and every design token (a CSS variable) with what it is for and its light and dark values. Use these tokens instead of raw colors, sizes, fonts or shadows.",
      annotations: readOnly,
    },
    async () => textResult(formatDesignSystem(await describeDesignSystem(cwd))),
  );

  server.registerTool(
    "list_components",
    {
      title: "List components",
      description:
        "Call when the UI needs a control or container (button, text field, checkbox, switch, card...) before building one by hand. Lists the dotaf components, what each is for, and whether this project already has it.",
      annotations: readOnly,
    },
    async () => textResult(formatComponents(await listProjectComponents(cwd))),
  );

  server.registerTool(
    "get_component",
    {
      title: "Get a component",
      description:
        "Call before using or adapting a dotaf component. Returns its props, a usage example and the install command for npm packages the project lacks; then either where the project keeps it, or its source and the command that adds it.",
      inputSchema: {
        name: z.string().describe('Component name from list_components, e.g. "text-field".'),
      },
      annotations: readOnly,
    },
    async ({ name }) => textResult(formatComponent(await describeComponent(cwd, name))),
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
          `Not in the project yet. Add it with \`npx dotaf add ${meta.name}\`, which copies these files:`,
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
