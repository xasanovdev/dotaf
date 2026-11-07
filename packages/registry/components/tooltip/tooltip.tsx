"use client";

import type { Ref } from "react";
import {
  Tooltip as AriaTooltip,
  TooltipTrigger as AriaTooltipTrigger,
  type TooltipProps as AriaTooltipProps,
  type TooltipTriggerComponentProps,
} from "react-aria-components";

import styles from "./tooltip.module.css";

// A short hint that shows on hover and keyboard focus. TooltipTrigger pairs it with the
// element it describes; both are separate exports so server components can use them.

export type TooltipTriggerProps = TooltipTriggerComponentProps;

// Hover waits 700ms, as in Radix: long enough to pass over a toolbar without a flurry of hints,
// half React Aria's 1500ms. Once one hint has shown, the next shows at once; focus never waits.
export function TooltipTrigger({ delay = 700, ...props }: TooltipTriggerProps) {
  return <AriaTooltipTrigger {...props} delay={delay} />;
}

export interface TooltipProps extends Omit<AriaTooltipProps, "className" | "style"> {
  ref?: Ref<HTMLDivElement>;
}

export function Tooltip({ placement = "top", offset = 6, ...props }: TooltipProps) {
  return <AriaTooltip {...props} placement={placement} offset={offset} className={styles.root} />;
}
