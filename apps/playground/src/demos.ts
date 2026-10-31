import type { ComponentType } from "react";

// Each registry component keeps its demo in its own folder as <name>/<name>.demo.tsx, with
// the demo as the default export. A new component shows up here without touching this file.
const modules = import.meta.glob<{ default: ComponentType }>("@registry/*/*.demo.tsx", {
  eager: true,
});

/** One entry per registry component, in registry (alphabetical) order. */
export const demos: { name: string; Demo: ComponentType }[] = Object.entries(modules)
  .map(([path, module]) => ({ name: path.split("/").at(-2) ?? path, Demo: module.default }))
  .sort((a, b) => a.name.localeCompare(b.name));
