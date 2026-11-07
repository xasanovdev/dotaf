"use client";

import { useEffect, useState, type Ref } from "react";
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";

import styles from "./button.module.css";

export interface ButtonProps extends Omit<AriaButtonProps, "className" | "style"> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  ref?: Ref<HTMLButtonElement>;
}

// How long a pending button waits before it shows the spinner, so a quick action never
// flashes it.
const SPINNER_DELAY_MS = 200;

export function Button({ variant = "primary", size = "md", children, ...props }: ButtonProps) {
  const showSpinner = useAfterDelay(props.isPending ?? false, SPINNER_DELAY_MS);

  return (
    <AriaButton {...props} className={styles.root} data-variant={variant} data-size={size}>
      {(values) => (
        <>
          {/* React Aria already tells screen readers the button is pending. */}
          {showSpinner ? <span className={styles.spinner} aria-hidden="true" /> : null}
          {typeof children === "function" ? children(values) : children}
        </>
      )}
    </AriaButton>
  );
}

/** True once `active` has stayed true for `delay` ms; false again as soon as it turns false. */
function useAfterDelay(active: boolean, delay: number): boolean {
  const [elapsed, setElapsed] = useState(false);

  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => {
      setElapsed(true);
    }, delay);
    return () => {
      clearTimeout(timer);
      setElapsed(false);
    };
  }, [active, delay]);

  return active && elapsed;
}
