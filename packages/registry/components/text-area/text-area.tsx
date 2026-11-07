"use client";

import type { KeyboardEvent, Ref } from "react";
import {
  TextArea as AriaTextArea,
  TextField as AriaTextField,
  FieldError,
  Label,
  Text,
  type TextAreaProps as AriaTextAreaProps,
  type TextFieldProps as AriaTextFieldProps,
  type FieldErrorProps,
  type LabelProps,
  type TextProps,
} from "react-aria-components";

import styles from "./text-area.module.css";

// React Aria wires the parts together (label, described-by, invalid state) through context.
// They are separate exports so server components can use them.

export interface TextAreaProps extends Omit<AriaTextFieldProps, "className" | "style"> {
  ref?: Ref<HTMLDivElement>;
}

export function TextArea(props: TextAreaProps) {
  return <AriaTextField {...props} className={styles.root} />;
}

export type TextAreaLabelProps = Omit<LabelProps, "className" | "style">;

export function TextAreaLabel(props: TextAreaLabelProps) {
  return <Label {...props} className={styles.label} />;
}

export interface TextAreaInputProps extends Omit<AriaTextAreaProps, "className" | "style"> {
  ref?: Ref<HTMLTextAreaElement>;
}

/** The multi-line input. Enter adds a line; ⌘/Ctrl+Enter submits the form it is in. */
export function TextAreaInput({ onKeyDown, ...props }: TextAreaInputProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return <AriaTextArea {...props} onKeyDown={handleKeyDown} className={styles.input} />;
}

export type TextAreaDescriptionProps = Omit<TextProps, "className" | "style" | "slot">;

export function TextAreaDescription(props: TextAreaDescriptionProps) {
  return <Text {...props} slot="description" className={styles.description} />;
}

export type TextAreaErrorProps = Omit<FieldErrorProps, "className" | "style">;

/** Shows the validation message while the value is invalid; renders nothing otherwise. */
export function TextAreaError(props: TextAreaErrorProps) {
  // A live region announces only changes inside it, so it stays mounted while the
  // message comes and goes.
  return (
    <div aria-live="polite" className={styles.errorRegion}>
      <FieldError {...props} className={styles.error} />
    </div>
  );
}
