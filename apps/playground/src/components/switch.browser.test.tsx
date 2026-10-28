import { Switch } from "@registry/switch/switch";
import { describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "virtual:dotaf.css";
import { contrast, sameColor } from "./contrast.js";
import { emulateMedia, pageColor, setTheme } from "./test-utils.js";

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
  test("Space toggles it and reports the new value", async () => {
    const onChange = vi.fn();
    await render(<Switch onChange={onChange}>Wi-Fi</Switch>);

    await userEvent.tab();
    await userEvent.keyboard(" ");

    await expect.element(page.getByRole("switch", { name: "Wi-Fi" })).toBeChecked();
    expect(onChange).toHaveBeenCalledWith(true);
  });

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
});
