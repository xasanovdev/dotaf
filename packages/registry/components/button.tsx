"use client";

import type { Ref } from "react";
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";
import styles from "./button.module.css";

export interface ButtonProps extends Omit<AriaButtonProps, "className" | "style"> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  ref?: Ref<HTMLButtonElement>;
}

export function Button({ variant = "primary", size = "md", ...props }: ButtonProps) {
  return <AriaButton {...props} className={styles.root} data-variant={variant} data-size={size} />;
}
