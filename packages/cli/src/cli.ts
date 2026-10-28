import { parseArgs } from "node:util";
import {
  DotafConfigError,
  DotafConfigExistsError,
  initProject,
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

  --theme <file|url>  Start from a shared dotaf.json (its brand; paths stay this project's)
  --yes               Use the defaults without asking
  --force             Let --theme replace an existing dotaf.json`;

const initOptions = {
  theme: { type: "string" },
  yes: { type: "boolean" },
  force: { type: "boolean" },
  help: { type: "boolean" },
} as const;

/** Runs a dotaf command and returns the process exit code. */
export async function run(args: string[], io: Io): Promise<number> {
  const [command, ...rest] = args;
  if (command === "--version" || command === "-v") {
    io.out(`dotaf ${io.version}`);
    return 0;
  }
  if (command === "help" || command === "--help" || command === "-h") {
    io.out(usage);
    return 0;
  }
  if (command !== "init") {
    io.err(usage);
    return 1;
  }

  let flags: ReturnType<
    typeof parseArgs<{ args: string[]; options: typeof initOptions }>
  >["values"];
  try {
    ({ values: flags } = parseArgs({ args: rest, options: initOptions }));
  } catch (error) {
    io.err(`${error instanceof Error ? error.message : String(error)}\n\n${usage}`);
    return 1;
  }
  if (flags.help === true) {
    io.out(usage);
    return 0;
  }

  let result: InitResult | undefined;
  try {
    result = await initProject(io.cwd, {
      theme: flags.theme,
      force: flags.force,
      askBrand: io.interactive && flags.yes !== true ? io.askBrand : undefined,
    });
  } catch (error) {
    io.err(failure(error));
    return 1;
  }
  if (result === undefined) {
    io.err("Cancelled; nothing was written.");
    return 1;
  }
  for (const line of report(result)) io.out(line);
  return 0;
}

// Agents read stderr: one clear sentence works better for them than a stack trace.
function failure(error: unknown): string {
  if (error instanceof DotafConfigExistsError) {
    return `${error.message} Add --force to replace it, or drop --theme to keep it.`;
  }
  if (error instanceof DotafConfigError) return error.message;
  const message = error instanceof Error ? error.message : String(error);
  return `dotaf init failed unexpectedly: ${message}`;
}

interface Step {
  title: string;
  command?: string;
}

function report(result: InitResult): string[] {
  const steps: Step[] = [
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
  ];
  return [
    result.wroteConfig
      ? `Wrote dotaf.json and ${result.css}.`
      : `Kept dotaf.json; regenerated ${result.css}.`,
    "",
    "Next steps",
    ...steps.flatMap(({ title, command }, index) => [
      `  ${String(index + 1)}. ${title}`,
      ...(command === undefined ? [] : [`       ${command}`]),
    ]),
  ];
}
