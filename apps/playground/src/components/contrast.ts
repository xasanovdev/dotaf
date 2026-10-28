// WCAG 2 contrast between two CSS colors, as the browser resolves them. A 1x1 canvas turns
// any color syntax (oklch, color-mix, relative colors) into sRGB bytes.
const context = document.createElement("canvas").getContext("2d", { willReadFrequently: true });

function rgba(color: string): Uint8ClampedArray {
  if (context === null) throw new Error("no 2d canvas context");
  context.clearRect(0, 0, 1, 1);
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  return context.getImageData(0, 0, 1, 1).data;
}

function srgb(color: string): [number, number, number] {
  const [r = 0, g = 0, b = 0, alpha = 0] = rgba(color);
  // A transparent color would read as black and make any contrast look fine.
  if (alpha < 255) throw new Error(`cannot measure contrast of a see-through color: ${color}`);
  return [r, g, b];
}

function luminance(color: string): number {
  const [r, g, b] = srgb(color).map((byte) => {
    const value = byte / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
}

export function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05);
}

/** Whether two CSS colors resolve to the same color and opacity, whatever their syntax. */
export function sameColor(a: string, b: string): boolean {
  return rgba(a).join() === rgba(b).join();
}
