"use client";

import type { ComponentPropsWithRef } from "react";

import styles from "./badge.module.css";

// Badge is plain HTML: React Aria has no badge primitive, and a static label has no
// interaction to borrow. Its words carry the meaning; the color only repeats it.

export interface BadgeProps extends Omit<ComponentPropsWithRef<"span">, "className" | "style"> {
  /** The status the badge stands for; each has its own color. */
  variant?: "neutral" | "primary" | "success" | "warning" | "danger";
}

export function Badge({ variant = "neutral", ...props }: BadgeProps) {
  return <span {...props} className={styles.root} data-variant={variant} />;
}
