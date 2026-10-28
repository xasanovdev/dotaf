"use client";

import type { ReactNode, Ref } from "react";
import { SwitchButton, SwitchField, type SwitchFieldProps } from "react-aria-components";
import styles from "./switch.module.css";

export interface SwitchProps extends Omit<SwitchFieldProps, "className" | "style" | "children"> {
  children?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export function Switch({ children, ...props }: SwitchProps) {
  return (
    <SwitchField {...props} className={styles.root}>
      <SwitchButton className={styles.button}>
        <span className={styles.track} aria-hidden="true">
          <span className={styles.thumb} />
        </span>
        {children}
      </SwitchButton>
    </SwitchField>
  );
}
