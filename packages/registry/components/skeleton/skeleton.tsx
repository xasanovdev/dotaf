"use client";

import type { ComponentPropsWithRef } from "react";

import styles from "./skeleton.module.css";

// Skeleton is plain HTML: React Aria has no skeleton primitive, and a placeholder has no
// interaction to borrow. It is hidden from screen readers; the region that is loading says
// so with aria-busy.

export interface SkeletonProps extends Omit<
  ComponentPropsWithRef<"div">,
  "className" | "style" | "children"
> {
  /** The shape of the content it stands for: lines of text, an avatar, or an image or card. */
  variant?: "text" | "circle" | "block";
  /** How many lines of text; the last is shorter, as a paragraph's is. Only for text. */
  lines?: number;
  /** The circle's diameter. Only for circle. */
  size?: "sm" | "md" | "lg";
}

export function Skeleton({ variant = "text", lines = 1, size = "md", ...props }: SkeletonProps) {
  if (variant === "text") {
    return (
      <div {...props} aria-hidden="true" className={styles.root} data-variant="text">
        {Array.from({ length: Math.max(1, lines) }, (_, index) => (
          <div key={index} className={styles.line} />
        ))}
      </div>
    );
  }

  return (
    <div
      {...props}
      aria-hidden="true"
      className={styles.root}
      data-variant={variant}
      data-size={variant === "circle" ? size : undefined}
    />
  );
}
