import { expect, test } from "vitest";
import { cdp, page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { App } from "./app.js";

const pageBackground = () => getComputedStyle(document.body).backgroundColor;
const dark = "rgb(10, 10, 10)"; // the default dark.background
const light = "rgb(255, 255, 255)"; // the default colors.background

// The OS prefers dark here, so Light can only win by setting data-theme itself.
test("System follows the OS until Light or Dark overrides it", async () => {
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-color-scheme", value: "dark" }],
  });
  await render(<App />);

  await expect.element(page.getByRole("radio", { name: "System" })).toBeChecked();
  await expect.poll(pageBackground).toBe(dark);

  await page.getByText("Light", { exact: true }).click();
  await expect.element(page.getByRole("radio", { name: "Light" })).toBeChecked();
  await expect.poll(pageBackground).toBe(light);

  await page.getByText("Dark", { exact: true }).click();
  await expect.poll(pageBackground).toBe(dark);

  await page.getByText("System", { exact: true }).click();
  await expect.poll(pageBackground).toBe(dark);
});
