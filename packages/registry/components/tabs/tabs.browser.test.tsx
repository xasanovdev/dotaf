import { I18nProvider } from "react-aria-components";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";

import { Tab, TabList, TabPanel, Tabs, type TabsProps } from "./tabs";

import "virtual:dotaf.css";

import { contrast, sameColor } from "../../test/browser/contrast";
import { emulateMedia, pageColor, setTheme } from "../../test/browser/test-utils";

function SettingsTabs(props: Omit<TabsProps, "children">) {
  return (
    <Tabs {...props}>
      <TabList aria-label="Settings">
        <Tab id="general">General</Tab>
        <Tab id="billing">Billing</Tab>
        <Tab id="team" isDisabled>
          Team
        </Tab>
        <Tab id="security">Security</Tab>
      </TabList>
      <TabPanel id="general">General settings</TabPanel>
      <TabPanel id="billing">Billing settings</TabPanel>
      <TabPanel id="team">Team settings</TabPanel>
      <TabPanel id="security">Security settings</TabPanel>
    </Tabs>
  );
}

const tab = (name: string) => page.getByRole("tab", { name });
const panel = () => page.getByRole("tabpanel");

describe("Tabs", () => {
  test("the tab list is named and the panel is labelled by its tab", async () => {
    await render(<SettingsTabs />);

    await expect.element(page.getByRole("tablist", { name: "Settings" })).toBeInTheDocument();
    await expect.element(panel()).toHaveAccessibleName("General");
    await expect.element(tab("General")).toHaveAttribute("aria-selected", "true");
  });

  test("arrow keys move between tabs, skip disabled ones and show their panel", async () => {
    const onSelectionChange = vi.fn();
    await render(<SettingsTabs onSelectionChange={onSelectionChange} />);

    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(panel()).toHaveTextContent("Billing settings");
    await userEvent.keyboard("{ArrowRight}");

    await expect.element(tab("Security")).toHaveFocus();
    await expect.element(panel()).toHaveTextContent("Security settings");
    expect(onSelectionChange).toHaveBeenLastCalledWith("security");
  });

  test("in right-to-left text the left arrow moves forward", async () => {
    await render(
      <I18nProvider locale="ar-EG">
        <SettingsTabs />
      </I18nProvider>,
    );

    await userEvent.tab();
    await userEvent.keyboard("{ArrowLeft}");

    await expect.element(tab("Billing")).toHaveFocus();
  });

  test("Tab moves from the selected tab into its panel", async () => {
    await render(<SettingsTabs />);

    await userEvent.tab();
    await userEvent.tab();

    await expect.element(panel()).toHaveFocus();
  });

  test("the focus ring shows for keyboard focus, not for a click", async () => {
    await render(<SettingsTabs />);

    await userEvent.tab();
    await expect.poll(() => getComputedStyle(tab("General").element()).outlineStyle).toBe("solid");

    await tab("Billing").click();
    await expect.poll(() => getComputedStyle(tab("Billing").element()).outlineStyle).toBe("none");
  });

  test.each(["light", "dark"] as const)(
    "tab text keeps 4.5:1 and the selected marker 3:1 on the page in %s mode",
    async (theme) => {
      setTheme(theme);
      await render(<SettingsTabs />);

      for (const name of ["General", "Billing"]) {
        const { color } = getComputedStyle(tab(name).element());
        expect(contrast(color, pageColor())).toBeGreaterThanOrEqual(4.5);
      }
      const marker = getComputedStyle(tab("General").element()).borderBottomColor;
      expect(contrast(marker, pageColor())).toBeGreaterThanOrEqual(3);
    },
  );

  test("vertical tabs mark the selected tab on the side facing the panel", async () => {
    await render(<SettingsTabs orientation="vertical" />);

    const marker = (name: string) => getComputedStyle(tab(name).element()).borderInlineEndColor;
    expect(contrast(marker("General"), pageColor())).toBeGreaterThanOrEqual(3);
    expect(sameColor(marker("General"), marker("Billing"))).toBe(false);
  });

  test("the selected tab still stands out in forced colors (Windows High Contrast)", async () => {
    await emulateMedia("forced-colors", "active");
    await render(<SettingsTabs />);

    const marker = (name: string) => getComputedStyle(tab(name).element()).borderBottomColor;
    expect(sameColor(marker("General"), marker("Billing"))).toBe(false);
  });

  // The duration tokens carry reduced motion, so tabs need no media query of their own.
  test("reduced motion stops the selection transition", async () => {
    await render(<SettingsTabs />);
    const durations = () => getComputedStyle(tab("General").element()).transitionDuration;
    expect(
      durations()
        .split(", ")
        .every((duration) => duration === "0s"),
    ).toBe(false);

    await emulateMedia("prefers-reduced-motion", "reduce");

    await expect
      .poll(() =>
        durations()
          .split(", ")
          .every((d) => d === "0s"),
      )
      .toBe(true);
  });
});
