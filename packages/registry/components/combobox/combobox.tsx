"use client";

import type { Ref } from "react";
import {
  ComboBox as AriaComboBox,
  Button,
  FieldError,
  Group,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Text,
  type ComboBoxProps as AriaComboBoxProps,
  type FieldErrorProps,
  type InputProps,
  type LabelProps,
  type ListBoxItemProps,
  type ListBoxProps,
  type TextProps,
} from "react-aria-components";

import styles from "./combobox.module.css";

// React Aria wires the parts together (label, input, list, invalid state) through context
// and filters the items by what the user types. The parts are separate exports so server
// components can use them.

export interface ComboboxProps<T extends object = object> extends Omit<
  AriaComboBoxProps<T>,
  "className" | "style"
> {
  ref?: Ref<HTMLDivElement>;
}

export function Combobox<T extends object>(props: ComboboxProps<T>) {
  // allowsEmptyCollection keeps the list open to say "No matches" instead of closing it.
  return <AriaComboBox allowsEmptyCollection {...props} className={styles.root} />;
}

export type ComboboxLabelProps = Omit<LabelProps, "className" | "style">;

export function ComboboxLabel(props: ComboboxLabelProps) {
  return <Label {...props} className={styles.label} />;
}

export type ComboboxInputProps = Omit<InputProps, "className" | "style">;

/** The text input, with a button that opens the full list. */
export function ComboboxInput(props: ComboboxInputProps) {
  return (
    <Group className={styles.box}>
      <Input {...props} className={styles.input} />
      <Button className={styles.toggle}>
        <svg viewBox="0 0 16 16" className={styles.chevron} aria-hidden="true">
          <path d="M4 6l4 4 4-4" />
        </svg>
      </Button>
    </Group>
  );
}

export type ComboboxPopoverProps<T extends object = object> = Omit<
  ListBoxProps<T>,
  "className" | "style"
>;

/**
 * The list of matches, in a popover under the input. Its children are ComboboxItems. Text
 * that matches nothing keeps it open with a "No matches" line.
 */
export function ComboboxPopover<T extends object>(props: ComboboxPopoverProps<T>) {
  return (
    // React Aria keeps a popover 12px from the screen edge by default, which pushes a list as
    // wide as a full-width trigger past the other edge. The page then scrolls sideways when the
    // keyboard moves to an option, and React Aria closes the list on that scroll.
    <Popover containerPadding={0} className={styles.popover}>
      <ListBox
        renderEmptyState={() => <div className={styles.empty}>No matches</div>}
        {...props}
        className={styles.list}
      />
    </Popover>
  );
}

export type ComboboxItemProps<T extends object = object> = Omit<
  ListBoxItemProps<T>,
  "className" | "style"
>;

export function ComboboxItem<T extends object>({ children, ...props }: ComboboxItemProps<T>) {
  // Plain text children are also what the input shows once picked; anything else needs textValue.
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

export type ComboboxDescriptionProps = Omit<TextProps, "className" | "style" | "slot">;

export function ComboboxDescription(props: ComboboxDescriptionProps) {
  return <Text {...props} slot="description" className={styles.description} />;
}

export type ComboboxErrorProps = Omit<FieldErrorProps, "className" | "style">;

/** Shows the validation message while the value is invalid; renders nothing otherwise. */
export function ComboboxError(props: ComboboxErrorProps) {
  // A live region announces only changes inside it, so it stays mounted while the
  // message comes and goes.
  return (
    <div aria-live="polite" className={styles.errorRegion}>
      <FieldError {...props} className={styles.error} />
    </div>
  );
}
