"use client";

import styles from "./ChartSkeleton.module.css";

export default function ChartSkeleton() {
  return (
    <div className={styles.card} aria-hidden>
      <div className={styles.shimmer} />
      <div className={styles.lines}>
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
