"use client";

import type { ReactNode, Ref } from "react";
import {
  RadioGroup as AriaRadioGroup,
  FieldError,
  Label,
  RadioButton,
  RadioField,
  Text,
  type RadioGroupProps as AriaRadioGroupProps,
  type FieldErrorProps,
  type LabelProps,
  type RadioFieldProps,
  type TextProps,
} from "react-aria-components";

import styles from "./radio-group.module.css";

// React Aria wires the parts together (label, described-by, arrow keys, invalid state)
// through context. They are separate exports so server components can use them.

export interface RadioGroupProps extends Omit<AriaRadioGroupProps, "className" | "style"> {
  ref?: Ref<HTMLDivElement>;
}

export function RadioGroup(props: RadioGroupProps) {
  return <AriaRadioGroup {...props} className={styles.root} />;
}

export type RadioGroupLabelProps = Omit<LabelProps, "className" | "style">;

export function RadioGroupLabel(props: RadioGroupLabelProps) {
  return <Label {...props} className={styles.label} />;
}

export interface RadioProps extends Omit<RadioFieldProps, "className" | "style" | "children"> {
  /** The option's label, shown next to the circle. */
  children?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

/** One option. Its value is what the group's onChange reports and the form submits. */
export function Radio({ children, ...props }: RadioProps) {
  return (
    <RadioField {...props} className={styles.radio}>
      <RadioButton className={styles.button}>
        <span className={styles.circle} aria-hidden="true" />
        {children}
      </RadioButton>
    </RadioField>
  );
}

export type RadioGroupDescriptionProps = Omit<TextProps, "className" | "style" | "slot">;

export function RadioGroupDescription(props: RadioGroupDescriptionProps) {
  return <Text {...props} slot="description" className={styles.description} />;
}

export type RadioGroupErrorProps = Omit<FieldErrorProps, "className" | "style">;

/** Shows the validation message while the choice is invalid; renders nothing otherwise. */
export function RadioGroupError(props: RadioGroupErrorProps) {
  // A live region announces only changes inside it, so it stays mounted while the
  // message comes and goes.
  return (
    <div aria-live="polite" className={styles.errorRegion}>
      <FieldError {...props} className={styles.error} />
    </div>
  );
}
