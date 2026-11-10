"use client";

import type { Ref } from "react";
import { ProgressBar, type ProgressBarProps } from "react-aria-components";

import styles from "./spinner.module.css";

export interface SpinnerProps extends Omit<
  ProgressBarProps,
  | "className"
  | "style"
  | "children"
  | "isIndeterminate"
  | "value"
  | "minValue"
  | "maxValue"
  | "valueLabel"
  | "formatOptions"
> {
  /** The look: ring, dots or petals. They all mean the same thing. */
  variant?: "ring" | "dots" | "petals";
  size?: "sm" | "md" | "lg";
  ref?: Ref<HTMLDivElement>;
}

// An indeterminate React Aria progress bar: screen readers hear a busy progress bar with
// its label and no value. The drawing inside is decoration, so it is hidden from them.
export function Spinner({ variant = "ring", size = "md", ...props }: SpinnerProps) {
  return (
    <ProgressBar
      aria-label="Loading"
      {...props}
      isIndeterminate
      className={styles.root}
      data-variant={variant}
      data-size={size}
    >
      {variant === "ring" ? <Ring /> : variant === "dots" ? <Dots /> : <Petals />}
    </ProgressBar>
  );
}

function Ring() {
  return (
    <svg className={styles.ring} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className={styles.track} cx="12" cy="12" r="10" />
      <circle className={styles.arc} cx="12" cy="12" r="10" pathLength="100" />
    </svg>
  );
}

function Dots() {
  return (
    <span className={styles.dots} aria-hidden="true">
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className={styles.dot} />
    </span>
  );
}

function Petals() {
  return (
    <span className={styles.petals} aria-hidden="true">
      {Array.from({ length: 8 }, (_, index) => (
        <span key={index} className={styles.petal} />
      ))}
    </span>
  );
}
