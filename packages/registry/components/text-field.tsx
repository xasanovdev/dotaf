"use client";

import type { Ref } from "react";
import {
  FieldError,
  Input,
  Label,
  Text,
  TextField as AriaTextField,
  type FieldErrorProps,
  type InputProps,
  type LabelProps,
  type TextFieldProps as AriaTextFieldProps,
  type TextProps,
} from "react-aria-components";
import styles from "./text-field.module.css";

// React Aria wires the parts together (label, described-by, invalid state) through context.
// They are separate exports so server components can use them.

export interface TextFieldProps extends Omit<AriaTextFieldProps, "className" | "style"> {
  ref?: Ref<HTMLDivElement>;
}

export function TextField(props: TextFieldProps) {
  return <AriaTextField {...props} className={styles.root} />;
}

export type TextFieldLabelProps = Omit<LabelProps, "className" | "style">;

export function TextFieldLabel(props: TextFieldLabelProps) {
  return <Label {...props} className={styles.label} />;
}

export type TextFieldInputProps = Omit<InputProps, "className" | "style">;

export function TextFieldInput(props: TextFieldInputProps) {
  return <Input {...props} className={styles.input} />;
}

export type TextFieldDescriptionProps = Omit<TextProps, "className" | "style" | "slot">;

export function TextFieldDescription(props: TextFieldDescriptionProps) {
  return <Text {...props} slot="description" className={styles.description} />;
}

export type TextFieldErrorProps = Omit<FieldErrorProps, "className" | "style">;

/** Shows the validation message while the field is invalid; renders nothing otherwise. */
export function TextFieldError(props: TextFieldErrorProps) {
  // A live region announces only changes inside it, so it stays mounted while the
  // message comes and goes.
  return (
    <div aria-live="polite" className={styles.errorRegion}>
      <FieldError {...props} className={styles.error} />
    </div>
  );
}
