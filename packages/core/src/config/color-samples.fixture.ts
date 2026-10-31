// Shared by the parser and JSON Schema tests so both are held to the same verdicts.

export const validColors = [
  "#4F46E5",
  "rgb(79 70 229)",
  "rgb(79, 70, 229)",
  "rgba(79, 70, 229, 0.5)",
  "rgb(31% 27% 90% / 50%)",
  "hsl(243 75% 59% / 0.5)",
  "hsl(240deg, 50%, 50%)",
  "hwb(240 10% 20%)",
  "oklch(62% 0.19 260deg)",
  "lch(60 40 30 / none)",
  "color(display-p3 0.3 0.27 0.9)",
];

// A browser drops each of these, and every token mixed from it goes too. The exception is
// relative color syntax (`from`): valid CSS, but dotaf derives colors itself and takes
// only plain colors as input.
export const invalidColors = [
  "rgb(foo)",
  "oklch(from red l c h)",
  "lab(50, 20, 30)",
  "color(srgb 1 0)",
  "rgb(79 70 229deg)",
  "oklch(0.6 0.2 260%)",
  "rgb(1 2 3 / 50deg)",
  "rgb(none, 70, 229)",
  "rgb(50%, 70, 229)",
  "hsl(240, 50, 50)",
  "rgb(1. 2 3)",
];
