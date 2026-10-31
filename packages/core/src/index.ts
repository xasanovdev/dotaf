export {
  configFileName,
  configJsonSchema,
  densities,
  DotafConfigError,
  parseConfig,
  radii,
} from "./config/config.js";
export type { DarkPalette, DotafConfig, Palette, ResolvedConfig } from "./config/config.js";
export { generateCss } from "./config/generate-css.js";
export type { DesignToken } from "./config/generate-css.js";
export { loadConfig } from "./project/load-config.js";
export { addComponents } from "./commands/add.js";
export type { AddedComponent, AddResult, KeptComponent } from "./commands/add.js";
export {
  describeComponent,
  describeDesignSystem,
  listProjectComponents,
} from "./commands/design-system.js";
export type { ComponentDetails, ComponentSummary, DesignSystem } from "./commands/design-system.js";
export { DotafConfigExistsError, initProject, readTheme } from "./commands/init.js";
export type { InitResult } from "./commands/init.js";
export { detectProject, DotafProjectNotFoundError } from "./project/project.js";
export type { Framework, PackageManager, ProjectInfo } from "./project/project.js";
export { lintProject } from "./commands/lint.js";
export type { LintFinding, LintReport } from "./commands/lint.js";
export { brandDefaults, updateTheme } from "./commands/theme.js";
export type { ThemeChange, ThemeChanges, ThemeUpdate } from "./commands/theme.js";
export { RegistryError } from "@dotaf/registry";
