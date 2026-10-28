import { Text } from "react-aria-components";

import styles from "./drifty.module.css";

export type { ZodType } from "zod";

export interface DriftyProps {
  size: "sm";
  tone?: "calm" | undefined;
}

export function Drifty({ size, tone = "calm" }: DriftyProps) {
  return (
    <Text className={styles.missing} data-size={size} data-tone={tone}>
      Drifty
    </Text>
  );
}
