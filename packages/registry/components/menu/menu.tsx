"use client";

import type { Ref } from "react";
import {
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  Popover,
  Separator,
  type MenuItemProps as AriaMenuItemProps,
  type MenuProps as AriaMenuProps,
  type SeparatorProps,
} from "react-aria-components";

import styles from "./menu.module.css";

// A list of actions that opens from a button. MenuTrigger pairs the button with the Menu;
// the parts are separate exports so server components can use them. Menus here run actions
// only: for picking a value use a select.

export { MenuTrigger, type MenuTriggerProps } from "react-aria-components";

export interface MenuProps<T extends object = object> extends Omit<
  AriaMenuProps<T>,
  "className" | "style" | "selectionMode" | "selectedKeys" | "defaultSelectedKeys"
> {
  ref?: Ref<HTMLDivElement>;
}

/** The menu in a popover under its trigger. Its children are MenuItems and MenuSeparators. */
export function Menu<T extends object>(props: MenuProps<T>) {
  return (
    <Popover className={styles.popover} placement="bottom start">
      <AriaMenu {...props} className={styles.root} />
    </Popover>
  );
}

export interface MenuItemProps<T extends object = object> extends Omit<
  AriaMenuItemProps<T>,
  "className" | "style"
> {
  /** danger for destructive actions such as delete. */
  variant?: "default" | "danger";
}

export function MenuItem<T extends object>({ variant = "default", ...props }: MenuItemProps<T>) {
  // Plain text children also name the item for typeahead; anything else needs textValue.
  const textValue =
    props.textValue ?? (typeof props.children === "string" ? props.children : undefined);
  return (
    <AriaMenuItem
      {...props}
      {...(textValue === undefined ? {} : { textValue })}
      className={styles.item}
      data-variant={variant}
    />
  );
}

export type MenuSeparatorProps = Omit<SeparatorProps, "className" | "style">;

export function MenuSeparator(props: MenuSeparatorProps) {
  return <Separator {...props} className={styles.separator} />;
}
