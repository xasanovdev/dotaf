import { parseArgs, type ParseArgsOptionsConfig } from "node:util";
import {
  addComponents,
  DotafConfigError,
  DotafConfigExistsError,
  initProject,
  RegistryError,
  type AddResult,
  type DotafConfig,
  type InitResult,
} from "@dotaf/core";

export interface Io {
  cwd: string;
  version: string;
  /** Whether a person can answer questions; false for agents and CI. */
  interactive: boolean;
  out: (line: string) => void;
  err: (line: string) => void;
  /** Asks for the brand; resolves undefined when the user cancels. */
  askBrand?: () => Promise<DotafConfig | undefined>;
}

export const usage = `Usage: dotaf init [--theme <file|url>] [--yes] [--force]
       dotaf add <component...> [--overwrite]

  init                Write dotaf.json and dotaf.css for this project
    --theme <file|url>  Start from a shared dotaf.json (its brand; paths stay this project's)
    --yes               Use the defaults without asking
    --force             Let --theme replace an existing dotaf.json
  add                 Copy components into paths.components, with the ones they use
    --overwrite         Replace component files that already exist`;

const initOptions = {
  theme: { type: "string" },
  yes: { type: "boolean" },
  force: { type: "boolean" },
} as const;

const addOptions = {
  overwrite: { type: "boolean" },
} as const;

/** Runs a dotaf command and returns the process exit code. */
export async function run(args: string[], io: Io): Promise<number> {
  const [command, ...rest] = args;
  if (command === "--version" || command === "-v") {
    io.out(`dotaf ${io.version}`);
    return 0;
  }
  if (["help", "--help", "-h"].includes(command ?? "") || rest.includes("--help")) {
    io.out(usage);
    return 0;
  }
  try {
    if (command === "init") return await init(rest, io);
    if (command === "add") return await add(rest, io);
  } catch (error) {
    io.err(failure(error));
    return 1;
  }
  io.err(usage);
  return 1;
}

/** Thrown for bad command-line input; run prints it with the usage. */
class UsageError extends Error {}

function parse<Options extends ParseArgsOptionsConfig>(
  args: string[],
  options: Options,
  { positionals = false } = {},
) {
  try {
    return parseArgs({ args, options, allowPositionals: positionals });
  } catch (error) {
    throw new UsageError(error instanceof Error ? error.message : String(error));
  }
}

async function init(args: string[], io: Io): Promise<number> {
  const { values: flags } = parse(args, initOptions);
  const result = await initProject(io.cwd, {
    theme: flags.theme,
    force: flags.force,
    askBrand: io.interactive && flags.yes !== true ? io.askBrand : undefined,
  });
  if (result === undefined) {
    io.err("Cancelled; nothing was written.");
    return 1;
  }
  for (const line of reportInit(result)) io.out(line);
  return 0;
}

async function add(args: string[], io: Io): Promise<number> {
  const { values: flags, positionals: names } = parse(args, addOptions, { positionals: true });
  if (names.length === 0)
    throw new UsageError("Name at least one component, e.g. dotaf add button");
  for (const line of reportAdd(
    await addComponents(io.cwd, names, { overwrite: flags.overwrite }),
  )) {
    io.out(line);
  }
  return 0;
}

// Agents read stderr: one clear sentence works better for them than a stack trace.
function failure(error: unknown): string {
  if (error instanceof UsageError) return `${error.message}\n\n${usage}`;
  if (error instanceof DotafConfigExistsError) {
    return `${error.message} Add --force to replace it, or drop --theme to keep it.`;
  }
  if (error instanceof DotafConfigError || error instanceof RegistryError) return error.message;
  const message = error instanceof Error ? error.message : String(error);
  return `dotaf failed unexpectedly: ${message}`;
}

interface Step {
  title: string;
  command?: string;
}

function formatSteps(list: Step[]): string[] {
  return list.flatMap(({ title, command }, index) => [
    `  ${String(index + 1)}. ${title}`,
    ...(command === undefined ? [] : [`       ${command}`]),
  ]);
}

function reportInit(result: InitResult): string[] {
  return [
    result.wroteConfig
      ? `Wrote dotaf.json and ${result.css}.`
      : `Kept dotaf.json; regenerated ${result.css}.`,
    "",
    "Next steps",
    ...formatSteps([
      ...(result.importInto === undefined
        ? []
        : [
            {
              title: `Import the tokens once, in ${result.importInto.file}:`,
              command: result.importInto.statement,
            },
          ]),
      ...(result.install === undefined
        ? []
        : [{ title: "Install the dependency the components use:", command: result.install }]),
      { title: "Connect your coding agent:", command: result.connectAgent },
    ]),
  ];
}

function reportAdd(result: AddResult): string[] {
  return [
    ...result.added.map(
      ({ name, files, neededBy }) =>
        `Added ${name}${neededBy === undefined ? "" : ` (${neededBy} uses it)`}: ${files.join(", ")}`,
    ),
    ...result.kept.map(({ name, existing, missing, neededBy }) => {
      const found = `${existing.join(", ")} already ${existing.length === 1 ? "exists" : "exist"}`;
      const gaps =
        missing.length === 0
          ? ""
          : `; ${missing.join(", ")} ${missing.length === 1 ? "is" : "are"} missing`;
      return neededBy === undefined
        ? `Kept ${name}: ${found}${gaps}. Add --overwrite to replace it.`
        : `Kept ${name} (${neededBy} uses it): ${found}${gaps}. ${neededBy} will use your version.`;
    }),
    ...(result.install === undefined
      ? []
      : [
          "",
          "Next step",
          ...formatSteps([
            { title: "Install what the components import:", command: result.install },
          ]),
        ]),
  ];
}
