import { onTestFinished } from "vitest";
import { cdp } from "vitest/browser";

// Theme and media emulation outlive a test unless undone, and CDP emulation applies to the
// whole browser page, so each helper registers its own cleanup, which runs even on failure.

export function setTheme(theme: "light" | "dark"): void {
  document.documentElement.dataset.theme = theme;
  onTestFinished(() => {
    delete document.documentElement.dataset.theme;
  });
}

export async function emulateMedia(name: "prefers-color-scheme" | "forced-colors", value: string) {
  await cdp().send("Emulation.setEmulatedMedia", { features: [{ name, value }] });
  onTestFinished(async () => {
    await cdp().send("Emulation.setEmulatedMedia", { features: [] });
  });
}

/** The page color from its token; component tests don't paint the body. */
export function pageColor(): string {
  return getComputedStyle(document.documentElement).getPropertyValue("--dotaf-color-bg");
}

/** The value a color token resolves to on the root, e.g. "--dotaf-color-primary". */
export function tokenColor(token: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(token);
}
