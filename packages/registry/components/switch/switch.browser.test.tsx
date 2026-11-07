import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";

import { Switch } from "./switch";

import "virtual:dotaf.css";

import { contrast, sameColor } from "../../test/browser/contrast";
import { emulateMedia, emulateTouch, pageColor, setTheme } from "../../test/browser/test-utils";

// The visible track is decoration next to the real (visually hidden) input.
function track(name: string): Element {
  const found = page
    .getByRole("switch", { name })
    .element()
    .closest("label")
    ?.querySelector("[aria-hidden]");
  if (found == null) throw new Error(`no track for ${name}`);
  return found;
}

function thumb(name: string): Element {
  const found = track(name).firstElementChild;
  if (found === null) throw new Error(`no thumb for ${name}`);
  return found;
}

describe("Switch", () => {
  test("the focus ring shows for keyboard focus only", async () => {
    await render(<Switch>Wi-Fi</Switch>);

    await userEvent.tab();
    await expect.poll(() => getComputedStyle(track("Wi-Fi")).outlineStyle).toBe("solid");

    await page.getByText("Wi-Fi").click();
    await expect.poll(() => getComputedStyle(track("Wi-Fi")).outlineStyle).toBe("none");
  });

  test.each(["light", "dark"] as const)(
    "track and thumb stay visible (3:1) in %s mode",
    async (theme) => {
      setTheme(theme);
      await render(
        <>
          <Switch>Off</Switch>
          <Switch defaultSelected>On</Switch>
        </>,
      );

      for (const name of ["Off", "On"]) {
        const trackColor = getComputedStyle(track(name)).backgroundColor;
        expect(contrast(trackColor, pageColor())).toBeGreaterThanOrEqual(3);
        const thumbColor = getComputedStyle(thumb(name)).backgroundColor;
        expect(contrast(thumbColor, trackColor)).toBeGreaterThanOrEqual(3);
      }
    },
  );

  test("the thumb stays inside the track in right-to-left text", async () => {
    await render(
      <div dir="rtl">
        <Switch>Off</Switch>
        <Switch defaultSelected>On</Switch>
      </div>,
    );

    for (const name of ["Off", "On"]) {
      const outer = track(name).getBoundingClientRect();
      const inner = thumb(name).getBoundingClientRect();
      expect(inner.left).toBeGreaterThanOrEqual(outer.left);
      expect(inner.right).toBeLessThanOrEqual(outer.right);
    }
    // In RTL, off rests at the right (start) and on moves left (end).
    const offset = (name: string) =>
      thumb(name).getBoundingClientRect().left - track(name).getBoundingClientRect().left;
    expect(offset("On")).toBeLessThan(offset("Off"));
  });

  test("on and off still differ in forced colors (Windows High Contrast)", async () => {
    await emulateMedia("forced-colors", "active");
    await render(
      <>
        <Switch>Off</Switch>
        <Switch defaultSelected>On</Switch>
      </>,
    );

    for (const name of ["Off", "On"]) {
      const trackStyle = getComputedStyle(track(name));
      expect(trackStyle.borderTopStyle).not.toBe("none");
      expect(
        sameColor(getComputedStyle(thumb(name)).backgroundColor, trackStyle.backgroundColor),
      ).toBe(false);
    }
  });
  // WCAG 2.5.8: a target is at least 24px; a fingertip needs about 44px.
  test("without a label it still takes a press 24px tall, and 44px on touch screens", async () => {
    await render(<Switch aria-label="Agree" />);
    const visible = track("Agree").getBoundingClientRect();
    const label = track("Agree").closest("label");
    const pressed = (reach: number) =>
      document
        .elementFromPoint(
          visible.x + visible.width / 2,
          visible.y + (visible.height + reach) / 2 - 1,
        )
        ?.closest("label");

    expect(pressed(24)).toBe(label);
    await emulateTouch();
    expect(pressed(44)).toBe(label);
  });
});
