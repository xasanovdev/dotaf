import { Skeleton } from "./skeleton";
import styles from "./skeleton.demo.module.css";

export default function SkeletonDemo() {
  return (
    <div className={styles.grid} aria-busy="true">
      {[1, 2].map((key) => (
        <div key={key} className={styles.card}>
          <div className={styles.media}>
            <Skeleton variant="block" />
          </div>
          <div className={styles.person}>
            <Skeleton variant="circle" size="sm" />
            <div className={styles.name}>
              <Skeleton />
            </div>
          </div>
          <Skeleton lines={3} />
        </div>
      ))}
    </div>
  );
}
