import type { SyntheticEvent } from "react";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";

import {
  TextArea,
  TextAreaDescription,
  TextAreaError,
  TextAreaInput,
  TextAreaLabel,
} from "./text-area";

import "virtual:dotaf.css";

import { contrast } from "../../test/browser/contrast";
import { emulateTouch, pageColor, setTheme } from "../../test/browser/test-utils";

function BioField() {
  return (
    <TextArea
      validationBehavior="aria"
      validate={(value) => (value.length > 20 ? "Keep it under 20 characters" : null)}
    >
      <TextAreaLabel>Bio</TextAreaLabel>
      <TextAreaInput />
      <TextAreaDescription>Shown on your profile.</TextAreaDescription>
      <TextAreaError />
    </TextArea>
  );
}

const input = () => page.getByRole("textbox", { name: "Bio" });

describe("TextArea", () => {
  test("the label names a multi-line input and the description describes it", async () => {
    await render(<BioField />);

    expect(input().element().tagName).toBe("TEXTAREA");
    await expect.element(input()).toHaveAccessibleDescription("Shown on your profile.");
  });

  test("Enter adds a new line instead of submitting", async () => {
    const onSubmit = vi.fn((event: SyntheticEvent) => {
      event.preventDefault();
    });
    await render(
      <form onSubmit={onSubmit}>
        <BioField />
      </form>,
    );

    await userEvent.type(input(), "one{Enter}two");

    await expect.element(input()).toHaveValue("one\ntwo");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test.each(["Meta", "Control"])("%s+Enter submits the form it is in", async (modifier) => {
    const onSubmit = vi.fn((event: SyntheticEvent) => {
      event.preventDefault();
    });
    await render(
      <form onSubmit={onSubmit}>
        <BioField />
      </form>,
    );

    await userEvent.type(input(), "hello");
    await userEvent.keyboard(`{${modifier}>}{Enter}{/${modifier}}`);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    await expect.element(input()).toHaveValue("hello");
  });

  test("an invalid value shows the error inside a live region that was there before it", async () => {
    const { container } = await render(<BioField />);
    const region = container.querySelector('[aria-live="polite"]');
    expect(region).not.toBeNull();

    await userEvent.type(input(), "this bio is far too long");

    await expect.element(input()).toBeInvalid();
    await expect.poll(() => region?.textContent).toContain("Keep it under 20 characters");
    await expect.element(input()).toHaveAccessibleDescription(/Keep it under 20 characters/);
  });

  test("it grows with its text rather than scrolling", async () => {
    await render(<BioField />);
    const before = input().element().getBoundingClientRect().height;

    await userEvent.type(input(), "1{Enter}2{Enter}3{Enter}4{Enter}5{Enter}6{Enter}7{Enter}8");

    expect(input().element().getBoundingClientRect().height).toBeGreaterThan(before);
  });

  test("the focus ring shows on click too, since text inputs take focus to type", async () => {
    await render(<BioField />);

    await input().click();

    await expect.poll(() => getComputedStyle(input().element()).outlineStyle).toBe("solid");
  });

  test.each(["light", "dark"] as const)(
    "the input outline stays visible (3:1) in %s mode",
    async (theme) => {
      setTheme(theme);
      await render(<BioField />);

      const border = getComputedStyle(input().element()).borderTopColor;
      expect(contrast(border, pageColor())).toBeGreaterThanOrEqual(3);
    },
  );

  // iOS zooms the page into an input whose text is under 16px.
  test("touch screens get 16px text, so the page doesn't zoom on focus", async () => {
    await render(<BioField />);
    await emulateTouch();

    expect(getComputedStyle(input().element()).fontSize).toBe("16px");
  });
});
