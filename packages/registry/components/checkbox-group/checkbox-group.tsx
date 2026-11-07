"use client";

import type { Ref } from "react";
import {
  CheckboxGroup as AriaCheckboxGroup,
  FieldError,
  Label,
  Text,
  type CheckboxGroupProps as AriaCheckboxGroupProps,
  type FieldErrorProps,
  type LabelProps,
  type TextProps,
} from "react-aria-components";

import styles from "./checkbox-group.module.css";

// The options are Checkboxes from the checkbox component, each with a value; React Aria
// wires them, the label, the description and the error to the group through context.
// The parts are separate exports so server components can use them.

export interface CheckboxGroupProps extends Omit<AriaCheckboxGroupProps, "className" | "style"> {
  /** vertical stacks the checkboxes; horizontal puts them in a row. */
  orientation?: "horizontal" | "vertical";
  ref?: Ref<HTMLDivElement>;
}

export function CheckboxGroup({ orientation = "vertical", ...props }: CheckboxGroupProps) {
  return <AriaCheckboxGroup {...props} className={styles.root} data-orientation={orientation} />;
}

export type CheckboxGroupLabelProps = Omit<LabelProps, "className" | "style">;

export function CheckboxGroupLabel(props: CheckboxGroupLabelProps) {
  return <Label {...props} className={styles.label} />;
}

export type CheckboxGroupDescriptionProps = Omit<TextProps, "className" | "style" | "slot">;

export function CheckboxGroupDescription(props: CheckboxGroupDescriptionProps) {
  return <Text {...props} slot="description" className={styles.description} />;
}

export type CheckboxGroupErrorProps = Omit<FieldErrorProps, "className" | "style">;

/** Shows the validation message while the choice is invalid; renders nothing otherwise. */
export function CheckboxGroupError(props: CheckboxGroupErrorProps) {
  // A live region announces only changes inside it, so it stays mounted while the
  // message comes and goes.
  return (
    <div aria-live="polite" className={styles.errorRegion}>
      <FieldError {...props} className={styles.error} />
    </div>
  );
}
