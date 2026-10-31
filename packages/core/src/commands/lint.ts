import { extname, relative, resolve, sep } from "node:path";
import type { LintResult } from "stylelint";

import { DotafConfigError } from "../config/config.js";
import { exists, loadProject, notProjects } from "../project/project.js";

export interface LintFinding {
  /** Relative to the project, with forward slashes. */
  file: string;
  line: number;
  column: number;
  rule: string;
  /** What to write instead, e.g. "Use var(--dotaf-space-3) instead of 12px". */
  message: string;
}

export interface LintReport {
  /** Every file checked, so a clean report is visibly not an empty one. */
  files: string[];
  findings: LintFinding[];
}

/**
 * Runs dotaf's stylelint rule over the project's CSS: `files` (absolute, or relative to the
 * project) or else every .css file but the generated dotaf.css, packages and build output.
 * Uses dotaf's rule only, never the project's own stylelint config, so a report means the same
 * in every project.
 */
export async function lintProject(start: string, files?: string[]): Promise<LintReport> {
  const { root, config } = await loadProject(start);
  // A named file that can't be checked must not pass as a clean result.
  for (const file of files ?? []) {
    if (extname(file) !== ".css") throw new DotafConfigError(`${file} is not a CSS file.`);
    if (!(await exists(resolve(root, file)))) throw new DotafConfigError(`${file} does not exist.`);
  }
  // Loaded on demand: stylelint is large, and only this function needs it.
  const [{ default: stylelint }, { default: dotafConfig }] = await Promise.all([
    import("stylelint"),
    import("@dotaf/stylelint-config"),
  ]);
  const { results } = await stylelint.lint({
    cwd: root,
    // Negated globs keep the search out of those folders instead of filtering what it found.
    files:
      files === undefined
        ? ["**/*.css", ...[...notProjects].map((folder) => `!**/${folder}/**`)]
        : files.map((file) => resolve(root, file)),
    config: dotafConfig,
    ignorePattern: [config.paths.css],
    allowEmptyInput: true,
  });

  const checked = results
    .filter(
      (result): result is LintResult & { source: string } =>
        result.ignored !== true && result.source !== undefined,
    )
    .map((result) => ({
      file: relative(root, result.source).split(sep).join("/"),
      warnings: result.warnings,
    }))
    .sort((a, b) => a.file.localeCompare(b.file));
  return {
    files: checked.map(({ file }) => file),
    findings: checked.flatMap(({ file, warnings }) =>
      warnings
        .map((warning) => ({
          file,
          line: warning.line,
          column: warning.column,
          rule: warning.rule,
          // stylelint appends the rule name; it is reported separately.
          message: warning.text.replace(` (${warning.rule})`, ""),
        }))
        .sort((a, b) => a.line - b.line || a.column - b.column),
    ),
  };
}
