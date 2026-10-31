// JSON helpers shared by the layers that read dotaf.json, package.json and themes.

/** JSON as editors save it: Windows editors may add a byte order mark, which JSON.parse rejects. */
export function parseJson(text: string): unknown {
  return JSON.parse(text.replace(/^\uFEFF/, ""));
}

/** A JSON object, as opposed to an array, null or a primitive. */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
