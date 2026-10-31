import { posix } from "node:path";
import {
  componentFiles,
  getComponent,
  listComponents,
  type RegistryComponent,
} from "@dotaf/registry";

import type { ResolvedConfig } from "./config.js";
import { describeTokens, type DesignToken } from "./generate-css.js";
import {
  existingFiles,
  installCommand,
  loadProject,
  readProject,
  type DotafProject,
} from "./project.js";

export interface DesignSystem {
  tokens: DesignToken[];
  /** What UI code in the project must do, written for an agent about to write it. */
  rules: string[];
  /** Where dotaf.css and the components live, relative to the project. */
  paths: ResolvedConfig["paths"];
}

export interface ComponentSummary {
  name: string;
  description: string;
  /** Its files already in paths.components, project-relative; empty when it isn't there. */
  installed: string[];
}

export interface ComponentDetails extends RegistryComponent {
  installed: string[];
  /** Installs the npm packages it imports that the project lacks; absent when it has them. */
  install?: string;
}

const rules = [
  "Colors, spacing (margin, padding, gap), corner radius, font family, font size, font weight, shadows, durations and easing come from the var(--dotaf-*) tokens below, never a raw hex, px, rem or named value. Pick a token by its description. Values with no token (border widths, line heights, icon and control sizes) stay raw.",
  "Use a dotaf component when one fits before building a control by hand; its files in the project are the project's own to read and edit.",
  "Build a new interactive control on react-aria-components and style its states through the data attributes it sets ([data-hovered], [data-pressed], [data-focus-visible], [data-disabled], [data-selected]) rather than :hover or :focus.",
  "Show focus with outline: var(--dotaf-focus-ring) and outline-offset: var(--dotaf-focus-ring-offset) on [data-focus-visible].",
  'Dark mode needs no extra CSS: color tokens follow prefers-color-scheme, and data-theme="light" or data-theme="dark" on any element themes its subtree.',
  "Change the brand in dotaf.json, then run `npx dotaf init` in the project root to regenerate dotaf.css. Never edit dotaf.css by hand.",
];

/** The project's tokens and the rules UI code follows, for the dotaf.json at or above `cwd`. */
export async function describeDesignSystem(cwd: string): Promise<DesignSystem> {
  const { config } = await loadProject(cwd);
  return { tokens: describeTokens(config), rules, paths: config.paths };
}

/** Which of a component's files are in the project's paths.components, project-relative. */
async function installed({ root, config }: DotafProject, name: string): Promise<string[]> {
  return existingFiles(
    root,
    componentFiles(name).map((file) => posix.join(config.paths.components, file)),
  );
}

/** Every registry component, with which of them the project already has. */
export async function listProjectComponents(cwd: string): Promise<ComponentSummary[]> {
  const [project, components] = await Promise.all([loadProject(cwd), listComponents()]);
  return Promise.all(
    components.map(async ({ name, description }) => ({
      name,
      description,
      installed: await installed(project, name),
    })),
  );
}

/**
 * A registry component's meta and source, which of its files the project has, and the
 * command that installs the npm packages it imports, if the project lacks any.
 */
export async function describeComponent(cwd: string, name: string): Promise<ComponentDetails> {
  const [project, component] = await Promise.all([loadProject(cwd), getComponent(name)]);
  const install = installCommand(await readProject(project.root), component.meta.dependencies);
  return {
    ...component,
    installed: await installed(project, name),
    ...(install === undefined ? {} : { install }),
  };
}
