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

export async function emulateMedia(
  name: "prefers-color-scheme" | "prefers-reduced-motion" | "forced-colors",
  value: string,
) {
  await cdp().send("Emulation.setEmulatedMedia", { features: [{ name, value }] });
  onTestFinished(async () => {
    await cdp().send("Emulation.setEmulatedMedia", { features: [] });
  });
}

/** Makes the page a touch screen: `(pointer: coarse)` matches until the test ends. */
export async function emulateTouch() {
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  onTestFinished(async () => {
    await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: false });
  });
}

/**
 * Every animation that starts from now on, in order, with its duration in ms. The duration
 * is read as it starts, so an exit animation counts even though its element leaves the page
 * right after.
 */
export function startedAnimations(): { target: Element; duration: number }[] {
  const started: { target: Element; duration: number }[] = [];
  const record = (event: AnimationEvent) => {
    if (!(event.target instanceof Element)) return;
    const duration = parseFloat(getComputedStyle(event.target).animationDuration) * 1000;
    started.push({ target: event.target, duration });
  };
  document.addEventListener("animationstart", record);
  onTestFinished(() => {
    document.removeEventListener("animationstart", record);
  });
  return started;
}

/** The page color from its token; component tests don't paint the body. */
export function pageColor(): string {
  return getComputedStyle(document.documentElement).getPropertyValue("--dotaf-color-bg");
}

/** The value a color token resolves to on the root, e.g. "--dotaf-color-primary". */
export function tokenColor(token: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(token);
}
