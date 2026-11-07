"use client";

import type { Ref } from "react";
import {
  Separator as AriaSeparator,
  type SeparatorProps as AriaSeparatorProps,
} from "react-aria-components";

import styles from "./separator.module.css";

export interface SeparatorProps extends Omit<AriaSeparatorProps, "className" | "style"> {
  ref?: Ref<HTMLElement>;
}

export function Separator({ orientation = "horizontal", ...props }: SeparatorProps) {
  return (
    <AriaSeparator
      {...props}
      orientation={orientation}
      className={styles.root}
      data-orientation={orientation}
    />
  );
}
