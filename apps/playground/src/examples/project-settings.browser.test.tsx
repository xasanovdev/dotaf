import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";

import "virtual:dotaf.css";

import { ProjectSettings } from "./project-settings.js";

test("the general tab picks a region from the select", async () => {
  await render(<ProjectSettings />);

  await page.getByRole("button", { name: /Region/ }).click();
  await page.getByRole("option", { name: "Frankfurt" }).click();

  await expect.element(page.getByRole("button", { name: /Region/ })).toHaveTextContent("Frankfurt");
});

test("removing a member asks first; Cancel keeps them, Remove takes them off the list", async () => {
  await render(<ProjectSettings />);
  await page.getByRole("tab", { name: "Members" }).click();
  const members = page.getByRole("list", { name: "Members" });

  const removeGrace = async () => {
    await page.getByRole("button", { name: "Actions for Grace Hopper" }).click();
    await page.getByRole("menuitem", { name: "Remove" }).click();
    await expect
      .element(page.getByRole("alertdialog"))
      .toHaveAccessibleName("Remove Grace Hopper?");
  };

  await removeGrace();
  await page.getByRole("button", { name: "Cancel" }).click();
  // The modal hides the page from assistive technology until it has closed.
  await expect.element(page.getByRole("alertdialog")).not.toBeInTheDocument();
  await expect.element(members.getByText("Grace Hopper")).toBeVisible();

  await removeGrace();
  await page.getByRole("button", { name: "Remove" }).click();
  await expect.element(page.getByRole("alertdialog")).not.toBeInTheDocument();
  await expect.element(members.getByText("Grace Hopper")).not.toBeInTheDocument();
  await expect.element(members.getByText("Ada Lovelace")).toBeVisible();
});

test("the icon-only copy button is named, and its tooltip explains it", async () => {
  await render(<ProjectSettings />);

  await userEvent.tab();

  await expect.element(page.getByRole("button", { name: "Copy project ID" })).toHaveFocus();
  await expect.element(page.getByRole("tooltip")).toHaveTextContent("Copy project ID");
});
