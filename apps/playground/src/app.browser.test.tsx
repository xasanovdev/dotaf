import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { App } from "./app.js";
import { emulateMedia } from "./components/test-utils.js";

const pageBackground = () => getComputedStyle(document.body).backgroundColor;
const dark = "rgb(10, 10, 10)"; // the default dark.background
const light = "rgb(255, 255, 255)"; // the default colors.background

// The OS prefers dark here, so Light can only win by setting data-theme itself.
test("System follows the OS until Light or Dark overrides it", async () => {
  await emulateMedia("prefers-color-scheme", "dark");
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

test("the examples follow the component demos", async () => {
  await render(<App />);

  const sections = page.getByRole("main").getByRole("heading", { level: 2 }).elements();
  expect(sections.at(-1)?.textContent).toBe("Examples");
  await expect
    .element(
      page
        .getByRole("region", { name: "Examples" })
        .getByRole("article", { name: "Notification settings" }),
    )
    .toBeVisible();
});
