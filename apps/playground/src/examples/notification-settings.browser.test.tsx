import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import "virtual:dotaf.css";

import { NotificationSettings } from "./notification-settings.js";

test("the card is named by its title and holds both switches and Save", async () => {
  await render(<NotificationSettings />);

  const card = page.getByRole("article", { name: "Notification settings" });
  await expect.element(card.getByRole("switch", { name: "Email notifications" })).toBeChecked();
  await expect.element(card.getByRole("switch", { name: "Push notifications" })).not.toBeChecked();
  await expect.element(card.getByRole("button", { name: "Save" })).toBeVisible();
});

test("Save confirms in a status message, and the next change clears it", async () => {
  await render(<NotificationSettings />);
  const status = page.getByRole("status");

  await expect.element(status).toBeEmptyDOMElement();
  await page.getByRole("button", { name: "Save" }).click();
  await expect.element(status).toHaveTextContent("Saved");

  await page.getByText("Push notifications").click();
  await expect.element(page.getByRole("switch", { name: "Push notifications" })).toBeChecked();
  await expect.element(status).toBeEmptyDOMElement();
});
