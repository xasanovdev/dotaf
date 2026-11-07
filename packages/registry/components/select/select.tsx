"use client";

import type { Ref } from "react";
import {
  Select as AriaSelect,
  Button,
  FieldError,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  SelectValue,
  Text,
  type SelectProps as AriaSelectProps,
  type ButtonProps,
  type FieldErrorProps,
  type LabelProps,
  type ListBoxItemProps,
  type ListBoxProps,
  type TextProps,
} from "react-aria-components";

import styles from "./select.module.css";

// React Aria wires the parts together (label, value, list, invalid state) through context.
// They are separate exports so server components can use them.

export interface SelectProps<T extends object = object> extends Omit<
  AriaSelectProps<T>,
  "className" | "style"
> {
  ref?: Ref<HTMLDivElement>;
}

export function Select<T extends object>(props: SelectProps<T>) {
  return <AriaSelect {...props} className={styles.root} />;
}

export type SelectLabelProps = Omit<LabelProps, "className" | "style">;

export function SelectLabel(props: SelectLabelProps) {
  return <Label {...props} className={styles.label} />;
}

export type SelectTriggerProps = Omit<ButtonProps, "className" | "style" | "children">;

/** The button that shows the chosen value, or the placeholder, and opens the list. */
export function SelectTrigger(props: SelectTriggerProps) {
  return (
    <Button {...props} className={styles.trigger}>
      <SelectValue className={styles.value} />
      <svg viewBox="0 0 16 16" className={styles.chevron} aria-hidden="true">
        <path d="M4 6l4 4 4-4" />
      </svg>
    </Button>
  );
}

export type SelectPopoverProps<T extends object = object> = Omit<
  ListBoxProps<T>,
  "className" | "style"
>;

/** The list of options, in a popover under the trigger. Its children are SelectItems. */
export function SelectPopover<T extends object>(props: SelectPopoverProps<T>) {
  return (
    <Popover className={styles.popover}>
      <ListBox {...props} className={styles.list} />
    </Popover>
  );
}

export type SelectItemProps<T extends object = object> = Omit<
  ListBoxItemProps<T>,
  "className" | "style"
>;

export function SelectItem<T extends object>({ children, ...props }: SelectItemProps<T>) {
  // Plain text children also name the option for typeahead; anything else needs textValue.
  const textValue = props.textValue ?? (typeof children === "string" ? children : undefined);
  return (
    <ListBoxItem
      {...props}
      {...(textValue === undefined ? {} : { textValue })}
      className={styles.item}
    >
      {(renderProps) => (
        <>
          {typeof children === "function" ? children(renderProps) : children}
          <svg viewBox="0 0 16 16" className={styles.check} aria-hidden="true">
            <path d="M3.5 8.5l3 3 6-7" />
          </svg>
        </>
      )}
    </ListBoxItem>
  );
}

export type SelectDescriptionProps = Omit<TextProps, "className" | "style" | "slot">;

export function SelectDescription(props: SelectDescriptionProps) {
  return <Text {...props} slot="description" className={styles.description} />;
}

export type SelectErrorProps = Omit<FieldErrorProps, "className" | "style">;

/** Shows the validation message while the value is invalid; renders nothing otherwise. */
export function SelectError(props: SelectErrorProps) {
  // A live region announces only changes inside it, so it stays mounted while the
  // message comes and goes.
  return (
    <div aria-live="polite" className={styles.errorRegion}>
      <FieldError {...props} className={styles.error} />
    </div>
  );
}
