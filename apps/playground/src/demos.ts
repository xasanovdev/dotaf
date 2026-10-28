import type { ComponentType } from "react";
import { ButtonDemo } from "./demos/button.js";
import { CardDemo } from "./demos/card.js";
import { CheckboxDemo } from "./demos/checkbox.js";
import { SwitchDemo } from "./demos/switch.js";
import { TextFieldDemo } from "./demos/text-field.js";

/** One entry per registry component, in registry (alphabetical) order. */
export const demos: { name: string; Demo: ComponentType }[] = [
  { name: "button", Demo: ButtonDemo },
  { name: "card", Demo: CardDemo },
  { name: "checkbox", Demo: CheckboxDemo },
  { name: "switch", Demo: SwitchDemo },
  { name: "text-field", Demo: TextFieldDemo },
];
