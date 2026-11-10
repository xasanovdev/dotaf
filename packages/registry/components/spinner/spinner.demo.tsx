import { Spinner } from "./spinner";
import styles from "./spinner.demo.module.css";

const variants = ["ring", "dots", "petals"] as const;

export default function SpinnerDemo() {
  return (
    <div className={styles.stack}>
      {variants.map((variant) => (
        <div key={variant} className={styles.row}>
          <Spinner variant={variant} size="sm" aria-label={`Loading, ${variant}, small`} />
          <Spinner variant={variant} aria-label={`Loading, ${variant}`} />
          <Spinner variant={variant} size="lg" aria-label={`Loading, ${variant}, large`} />
          <span className={styles.inline}>
            <Spinner variant={variant} size="sm" aria-label={`Syncing, ${variant}`} />
            Syncing
          </span>
        </div>
      ))}
    </div>
  );
}
