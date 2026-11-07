import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { Checkbox } from "../checkbox";
import {
  CheckboxGroup,
  CheckboxGroupDescription,
  CheckboxGroupError,
  CheckboxGroupLabel,
  type CheckboxGroupProps,
} from "./checkbox-group";

import "virtual:dotaf.css";

function NotifyGroup(props: Omit<CheckboxGroupProps, "children">) {
  return (
    <CheckboxGroup {...props}>
      <CheckboxGroupLabel>Notify me by</CheckboxGroupLabel>
      <Checkbox value="email">Email</Checkbox>
      <Checkbox value="sms">SMS</Checkbox>
      <Checkbox value="push">Push</Checkbox>
      <CheckboxGroupDescription>Pick at least one.</CheckboxGroupDescription>
      <CheckboxGroupError />
    </CheckboxGroup>
  );
}

const box = (name: string) => page.getByRole("checkbox", { name });

describe("CheckboxGroup", () => {
  // A live region only announces changes inside it, so it must exist before the error does.
  test("an invalid choice shows the error in a live region and describes the group", async () => {
    const { container } = await render(
      <NotifyGroup
        validationBehavior="aria"
        validate={(values) => (values.length === 0 ? "Pick at least one channel" : null)}
        defaultValue={["sms"]}
      />,
    );
    const region = container.querySelector('[aria-live="polite"]');
    expect(region).not.toBeNull();

    await page.getByText("SMS").click();

    await expect.poll(() => region?.textContent).toContain("Pick at least one channel");
    await expect
      .element(page.getByRole("group"))
      .toHaveAccessibleDescription(/Pick at least one channel/);
  });

  test("a horizontal group lays its checkboxes out in a row", async () => {
    await render(
      <div style={{ display: "grid", height: 200 }}>
        <NotifyGroup orientation="horizontal" />
      </div>,
    );

    const top = (name: string) => box(name).element().closest("label")?.getBoundingClientRect().top;
    expect(top("SMS")).toBe(top("Email"));
    expect(top("Push")).toBe(top("Email"));
    const group = page.getByRole("group").element().getBoundingClientRect();
    expect((top("Email") ?? Infinity) - group.top).toBeLessThan(40);
  });
});
