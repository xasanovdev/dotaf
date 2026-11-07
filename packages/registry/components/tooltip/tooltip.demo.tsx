import { Button } from "../button";
import { Tooltip, TooltipTrigger } from "./tooltip";
import styles from "./tooltip.demo.module.css";

export default function TooltipDemo() {
  return (
    <div className={styles.row}>
      <TooltipTrigger>
        <Button variant="secondary">Hover or focus me</Button>
        <Tooltip>Saves a copy to your drafts</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger>
        <Button variant="ghost" aria-label="Help">
          ?
        </Button>
        <Tooltip placement="bottom">Opens the docs</Tooltip>
      </TooltipTrigger>
    </div>
  );
}
