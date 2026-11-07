"use client";

import type { Ref } from "react";
import {
  NumberField as AriaNumberField,
  Button,
  FieldError,
  Group,
  Input,
  Label,
  Text,
  type NumberFieldProps as AriaNumberFieldProps,
  type FieldErrorProps,
  type InputProps,
  type LabelProps,
  type TextProps,
} from "react-aria-components";

import styles from "./number-field.module.css";

// React Aria wires the parts together (label, steppers, described-by, invalid state)
// through context, and names the steppers "Increase" and "Decrease" in the user's language.
// The parts are separate exports so server components can use them.

export interface NumberFieldProps extends Omit<AriaNumberFieldProps, "className" | "style"> {
  ref?: Ref<HTMLDivElement>;
}

export function NumberField(props: NumberFieldProps) {
  return <AriaNumberField {...props} className={styles.root} />;
}

export type NumberFieldLabelProps = Omit<LabelProps, "className" | "style">;

export function NumberFieldLabel(props: NumberFieldLabelProps) {
  return <Label {...props} className={styles.label} />;
}

export type NumberFieldInputProps = Omit<InputProps, "className" | "style">;

/** The number, between a − and a + button. Arrow keys step it too. */
export function NumberFieldInput(props: NumberFieldInputProps) {
  return (
    <Group className={styles.box}>
      <Button slot="decrement" className={styles.step}>
        <svg viewBox="0 0 16 16" className={styles.icon} aria-hidden="true">
          <path d="M4 8h8" />
        </svg>
      </Button>
      <Input {...props} className={styles.input} />
      <Button slot="increment" className={styles.step}>
        <svg viewBox="0 0 16 16" className={styles.icon} aria-hidden="true">
          <path d="M8 4v8M4 8h8" />
        </svg>
      </Button>
    </Group>
  );
}

export type NumberFieldDescriptionProps = Omit<TextProps, "className" | "style" | "slot">;

export function NumberFieldDescription(props: NumberFieldDescriptionProps) {
  return <Text {...props} slot="description" className={styles.description} />;
}

export type NumberFieldErrorProps = Omit<FieldErrorProps, "className" | "style">;

/** Shows the validation message while the value is invalid; renders nothing otherwise. */
export function NumberFieldError(props: NumberFieldErrorProps) {
  // A live region announces only changes inside it, so it stays mounted while the
  // message comes and goes.
  return (
    <div aria-live="polite" className={styles.errorRegion}>
      <FieldError {...props} className={styles.error} />
    </div>
  );
}
