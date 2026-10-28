import { intro, isCancel, select, text } from "@clack/prompts";
import { densities, DotafConfigError, parseConfig, radii, type DotafConfig } from "@dotaf/core";

// The same schema that reads dotaf.json judges the answers and supplies the defaults.
const defaults = parseConfig({});

function colorError(value: string | undefined): string | undefined {
  try {
    parseConfig({ colors: { primary: value } });
    return undefined;
  } catch (error) {
    if (!(error instanceof DotafConfigError)) throw error;
    return "Use a hex color (#4f46e5) or a CSS color function (oklch(0.6 0.2 260))";
  }
}

/** Asks for the brand in a terminal; undefined when the user cancels. */
export async function askBrand(): Promise<DotafConfig | undefined> {
  intro("dotaf");
  const primary = await text({
    message: "Primary color",
    initialValue: defaults.colors.primary,
    validate: colorError,
  });
  if (isCancel(primary)) return undefined;

  const radius = await select<(typeof radii)[number]>({
    message: "Corner radius",
    initialValue: defaults.radius,
    options: radii.map((value) => ({ value })),
  });
  if (isCancel(radius)) return undefined;

  const density = await select<(typeof densities)[number]>({
    message: "Density",
    initialValue: defaults.density,
    options: densities.map((value) => ({ value })),
  });
  if (isCancel(density)) return undefined;

  return { colors: { primary }, radius, density };
}
