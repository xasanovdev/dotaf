import { Card } from "@registry/card/card";
import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import "virtual:dotaf.css";
import { contrast } from "./contrast.js";
import { setTheme } from "./test-utils.js";

describe("Card", () => {
  test("the title names the card for assistive technology", async () => {
    await render(
      <Card>
        <Card.Header>
          <Card.Title>Pro plan</Card.Title>
        </Card.Header>
        <Card.Body>Unlimited projects.</Card.Body>
      </Card>,
    );

    await expect.element(page.getByRole("article", { name: "Pro plan" })).toBeVisible();
  });

  test("the title renders the heading level asked for, h3 by default", async () => {
    await render(
      <>
        <Card>
          <Card.Title>Default</Card.Title>
        </Card>
        <Card>
          <Card.Title level={2}>Section</Card.Title>
        </Card>
      </>,
    );

    await expect.element(page.getByRole("heading", { level: 3, name: "Default" })).toBeVisible();
    await expect.element(page.getByRole("heading", { level: 2, name: "Section" })).toBeVisible();
  });

  test("two cards get two different names", async () => {
    await render(
      <>
        <Card>
          <Card.Title>Free</Card.Title>
        </Card>
        <Card>
          <Card.Title>Pro</Card.Title>
        </Card>
      </>,
    );

    await expect.element(page.getByRole("article", { name: "Free" })).toBeVisible();
    await expect.element(page.getByRole("article", { name: "Pro" })).toBeVisible();
  });

  test("a card without a title points at no missing id", async () => {
    const { container } = await render(
      <Card>
        <Card.Body>Untitled</Card.Body>
      </Card>,
    );

    expect(container.querySelector("article")?.hasAttribute("aria-labelledby")).toBe(false);
  });

  test("a title with its own id still names the card", async () => {
    await render(
      <Card>
        <Card.Title id="plan-title">Team plan</Card.Title>
      </Card>,
    );

    await expect.element(page.getByRole("article", { name: "Team plan" })).toBeVisible();
  });

  test.each(["light", "dark"] as const)("card text keeps 4.5:1 in %s mode", async (theme) => {
    setTheme(theme);
    const { container } = await render(
      <Card>
        <Card.Header>
          <Card.Title>Pro plan</Card.Title>
          $12 per month
        </Card.Header>
        <Card.Body>Unlimited projects.</Card.Body>
      </Card>,
    );

    const article = container.querySelector("article");
    if (article === null) throw new Error("no article");
    const surface = getComputedStyle(article).backgroundColor;
    for (const part of [article.querySelector("header"), article.querySelector("h3"), article]) {
      if (part === null) throw new Error("missing part");
      expect(contrast(getComputedStyle(part).color, surface)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
