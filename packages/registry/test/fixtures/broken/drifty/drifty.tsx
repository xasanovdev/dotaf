import { Text } from "react-aria-components";

// @ts-expect-error -- the old doubled form, pointing at a component the registry lacks
import { Ghost } from "../ghost/ghost";
import styles from "./drifty.module.css";

export type { ZodType } from "zod";

export interface DriftyProps {
  size: "sm";
  tone?: "calm" | undefined;
}

export function Drifty({ size, tone = "calm" }: DriftyProps) {
  return (
    <Text className={styles.missing} data-size={size} data-tone={tone}>
      <Ghost />
    </Text>
  );
}
