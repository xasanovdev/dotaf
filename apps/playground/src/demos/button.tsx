import { Button } from "@registry/button";

import styles from "./demo.module.css";

const variants = ["primary", "secondary", "ghost", "danger"] as const;
const sizes = ["sm", "md", "lg"] as const;

export function ButtonDemo() {
  return (
    <div className={styles.stack}>
      {sizes.map((size) => (
        <div key={size} className={styles.row}>
          {variants.map((variant) => (
            <Button key={variant} variant={variant} size={size}>
              {variant} {size}
            </Button>
          ))}
          <Button size={size} isDisabled>
            disabled
          </Button>
        </div>
      ))}
    </div>
  );
}
