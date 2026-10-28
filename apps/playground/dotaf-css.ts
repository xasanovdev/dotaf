import { join } from "node:path";
import { configFileName, generateCss, loadConfig } from "@dotaf/core";
import type { Plugin } from "vite";

const id = "virtual:dotaf.css";
const resolvedId = `\0${id}`;

/** Serves `virtual:dotaf.css`, generated from the dotaf.json next to the Vite root. */
export function dotafCss(): Plugin {
  let configPath = "";
  return {
    name: "dotaf-css",
    configResolved(config) {
      configPath = join(config.root, configFileName);
    },
    resolveId(source) {
      return source === id ? resolvedId : undefined;
    },
    async load(loadedId) {
      if (loadedId !== resolvedId) return undefined;
      this.addWatchFile(configPath);
      return generateCss(await loadConfig(join(configPath, "..")));
    },
    // A virtual module has no file of its own to change, so an edit to dotaf.json must
    // drop its cached CSS explicitly; returning it then hot-swaps the stylesheet.
    hotUpdate({ file }) {
      if (file !== configPath) return undefined;
      const module = this.environment.moduleGraph.getModuleById(resolvedId);
      if (module === undefined) return [];
      this.environment.moduleGraph.invalidateModule(module);
      return [module];
    },
  };
}
