"use client";

import type { ReactNode } from "react";

import { Badge } from "./badge";
import styles from "./tag.module.css";

export interface TagProps {
  children: ReactNode;
}

export function Tag({ children }: TagProps) {
  return (
    <span className={styles.root}>
      <Badge>{children}</Badge>
    </span>
  );
}
