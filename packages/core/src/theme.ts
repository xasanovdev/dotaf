import { readFile } from "node:fs/promises";
import { join } from "node:path";

import {
  DotafConfigError,
  notBrand,
  parseConfig,
  type Palette,
  type ResolvedConfig,
} from "./config.js";
import { configFileName, writeConfig, writeStylesheet } from "./load-config.js";
import { isObject, loadProject, parseJson } from "./project.js";

type Settable<T> = { [K in keyof T]?: T[K] | null | undefined };

/** Brand fields to change. null puts one back to its default; a dark accent is derived again. */
export interface ThemeChanges {
  colors?: Settable<Palette> | undefined;
  dark?: Settable<Palette> | undefined;
  font?: Settable<ResolvedConfig["font"]> | undefined;
  radius?: ResolvedConfig["radius"] | null | undefined;
  density?: ResolvedConfig["density"] | null | undefined;
}

export interface ThemeChange {
  /** E.g. `colors.primary` or `radius`. */
  field: string;
  /** As the project resolves it; undefined for a dark accent that is derived. */
  from: string | undefined;
  to: string | undefined;
}

export interface ThemeUpdate {
  changed: ThemeChange[];
  /** Where dotaf.css lives, relative to the project. */
  css: string;
}

type JsonObject = Record<string, unknown>;

/** `changes` laid over `base`: objects merge, null deletes a key, an emptied object goes too. */
function merge(base: JsonObject, changes: JsonObject): JsonObject {
  const keys = new Set([...Object.keys(base), ...Object.keys(changes)]);
  return Object.fromEntries(
    [...keys].flatMap((key): [string, unknown][] => {
      const value = changes[key];
      if (value === undefined) return key in base ? [[key, base[key]]] : [];
      if (value === null) return [];
      if (!isObject(value)) return [[key, value]];
      const merged = merge(isObject(base[key]) ? base[key] : {}, value);
      return Object.keys(merged).length === 0 ? [] : [[key, merged]];
    }),
  );
}

/** The brand as flat fields, e.g. `colors.primary`; paths are not part of a theme. */
function brandFields({ colors, dark, font, radius, density }: ResolvedConfig) {
  // The spread turns the Palette interface into a plain object type with an index signature.
  const groups: Record<string, Record<string, string | undefined>> = {
    colors: { ...colors },
    dark,
    font,
  };
  return new Map<string, string | undefined>([
    ...Object.entries(groups).flatMap(([group, values]) =>
      Object.entries(values).map(([key, value]): [string, string | undefined] => [
        `${group}.${key}`,
        value,
      ]),
    ),
    ["radius", radius],
    ["density", density],
  ]);
}

/** Every field a theme can set, with dotaf's default; undefined for a dark accent, which is derived. */
export function brandDefaults(): Map<string, string | undefined> {
  const defaults = parseConfig({});
  const fields = brandFields(defaults);
  for (const key of Object.keys(defaults.colors)) {
    if (!fields.has(`dark.${key}`)) fields.set(`dark.${key}`, undefined);
  }
  return fields;
}

function diff(before: ResolvedConfig, after: ResolvedConfig): ThemeChange[] {
  const from = brandFields(before);
  const to = brandFields(after);
  return [...new Set([...from.keys(), ...to.keys()])]
    .filter((field) => from.get(field) !== to.get(field))
    .map((field) => ({ field, from: from.get(field), to: to.get(field) }));
}

/**
 * Lays brand changes over the project's dotaf.json and regenerates dotaf.css. Fields not named
 * keep their value. Nothing is written unless the result is a valid dotaf.json that differs
 * from the current one.
 */
export async function updateTheme(start: string, changes: ThemeChanges): Promise<ThemeUpdate> {
  if (Object.keys(changes).some((key) => notBrand.includes(key))) {
    throw new DotafConfigError(
      "paths and $schema can't be changed by a theme update; it changes the brand only.",
    );
  }
  const { root, config: before } = await loadProject(start);
  const file = join(root, configFileName);
  const current = parseJson(await readFile(file, "utf8"));
  const base = isObject(current) ? current : {};
  const next = merge(base, { ...changes });
  const after = parseConfig(next, file);

  if (JSON.stringify(next) !== JSON.stringify(base)) {
    await writeConfig(root, next);
    await writeStylesheet(root, after);
  }
  return { changed: diff(before, after), css: after.paths.css };
}
