import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";

import { Checkbox } from "../checkbox/checkbox";
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
  test("the label names the group and the description describes it", async () => {
    await render(<NotifyGroup />);

    const group = page.getByRole("group", { name: "Notify me by" });
    await expect.element(group).toHaveAccessibleDescription("Pick at least one.");
  });

  test("each checkbox adds or removes its value, and onChange gets them all", async () => {
    const onChange = vi.fn();
    await render(<NotifyGroup defaultValue={["email"]} onChange={onChange} />);

    await page.getByText("Push").click();
    expect(onChange).toHaveBeenLastCalledWith(["email", "push"]);

    await page.getByText("Email").click();
    expect(onChange).toHaveBeenLastCalledWith(["push"]);
    await expect.element(box("Email")).not.toBeChecked();
  });

  test("the form submits every checked value under the group's name", async () => {
    let submitted: string[] = [];
    await render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitted = new FormData(event.currentTarget).getAll("notify").map(String);
        }}
      >
        <NotifyGroup name="notify" defaultValue={["email", "push"]} />
        <button type="submit">Save</button>
      </form>,
    );

    await page.getByRole("button", { name: "Save" }).click();

    expect(submitted).toEqual(["email", "push"]);
  });

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

  test("Tab moves through each checkbox and Space toggles the focused one", async () => {
    await render(<NotifyGroup />);

    await userEvent.tab();
    await userEvent.tab();
    await userEvent.keyboard(" ");

    await expect.element(box("SMS")).toBeChecked();
  });

  test("disabling the group disables every checkbox", async () => {
    await render(<NotifyGroup isDisabled />);

    for (const name of ["Email", "SMS", "Push"]) {
      await expect.element(box(name)).toBeDisabled();
    }
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
