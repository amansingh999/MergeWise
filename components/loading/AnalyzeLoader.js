"use client";

import { motion, AnimatePresence } from "framer-motion";
import styles from "./AnalyzeLoader.module.css";

const STEPS = [
  "Analyzing Pull Request…",
  "Fetching repository…",
  "Running AI review…",
  "Finding issues…",
  "Calculating score…",
  "Generating suggestions…",
];

export default function AnalyzeLoader({ progress = 0 }) {
  const idx = Math.min(STEPS.length - 1, Math.floor((progress / 100) * STEPS.length));
  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className={styles.panel}>
          <div className={styles.orb} aria-hidden />
          <p className={styles.title}>{STEPS[idx]}</p>
          <div className={styles.bar} aria-hidden>
            <motion.div
              className={styles.fill}
              initial={{ width: "8%" }}
              animate={{ width: `${Math.max(8, progress)}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            />
          </div>
          <p className={styles.hint}>This can take up to a few minutes for large PRs.</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
