"use client";

import type { ComponentPropsWithRef, Ref } from "react";
import { Form as AriaForm, type FormProps as AriaFormProps } from "react-aria-components";

import styles from "./form.module.css";

// React Aria's Form hands server errors to each field by its name and sets how every field
// inside validates. FormActions is plain HTML: a row of buttons has no interaction of its own.

export interface FormProps extends Omit<AriaFormProps, "className" | "style"> {
  ref?: Ref<HTMLFormElement>;
}

export function Form(props: FormProps) {
  return <AriaForm {...props} className={styles.root} />;
}

export type FormActionsProps = Omit<ComponentPropsWithRef<"div">, "className" | "style">;

/** The form's buttons, in a row at its end; put the submit button last. */
export function FormActions(props: FormActionsProps) {
  return <div {...props} className={styles.actions} />;
}
