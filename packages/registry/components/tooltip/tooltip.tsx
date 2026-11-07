"use client";

import type { Ref } from "react";
import {
  Tooltip as AriaTooltip,
  type TooltipProps as AriaTooltipProps,
} from "react-aria-components";

import styles from "./tooltip.module.css";

// A short hint that shows on hover and keyboard focus. TooltipTrigger pairs it with the
// element it describes; both are separate exports so server components can use them.

export {
  TooltipTrigger,
  type TooltipTriggerComponentProps as TooltipTriggerProps,
} from "react-aria-components";

export interface TooltipProps extends Omit<AriaTooltipProps, "className" | "style"> {
  ref?: Ref<HTMLDivElement>;
}

export function Tooltip({ placement = "top", offset = 6, ...props }: TooltipProps) {
  return <AriaTooltip {...props} placement={placement} offset={offset} className={styles.root} />;
}
