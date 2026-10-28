"use client";

import type { Ref } from "react";
import { Text, type TextProps } from "react-aria-components";

import styles from "./badge.module.css";

export interface BadgeProps extends Omit<TextProps, "className" | "style"> {
  variant?: "neutral" | "danger";
  ref?: Ref<HTMLElement>;
}

export function Badge({ variant = "neutral", ...props }: BadgeProps) {
  return <Text {...props} className={styles.root} data-variant={variant} />;
}
