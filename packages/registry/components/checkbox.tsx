"use client";

import type { ReactNode, Ref } from "react";
import { CheckboxButton, CheckboxField, type CheckboxFieldProps } from "react-aria-components";

import styles from "./checkbox.module.css";

export interface CheckboxProps extends Omit<
  CheckboxFieldProps,
  "className" | "style" | "children"
> {
  children?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export function Checkbox({ children, ...props }: CheckboxProps) {
  return (
    <CheckboxField {...props} className={styles.root}>
      <CheckboxButton className={styles.button}>
        <span className={styles.box} aria-hidden="true">
          <svg viewBox="0 0 16 16" className={styles.check}>
            <path d="M3.5 8.5l3 3 6-7" />
          </svg>
          <svg viewBox="0 0 16 16" className={styles.dash}>
            <path d="M4 8h8" />
          </svg>
        </span>
        {children}
      </CheckboxButton>
    </CheckboxField>
  );
}
