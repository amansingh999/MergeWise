"use client";

import { motion } from "framer-motion";
import styles from "./ChartCard.module.css";
import meterStyles from "./RiskMeter.module.css";

export default function RiskMeter({ value, label = "Risk meter" }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  const hue = v < 40 ? 160 : v < 70 ? 40 : 0;
  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.07 }}
    >
      <div className={styles.head}>
        <h3 className={styles.title}>{label}</h3>
        <p className={styles.sub}>Composite risk intensity (0–100).</p>
      </div>
      <div className={meterStyles.wrap} aria-label={`Risk ${v} out of 100`}>
        <div className={meterStyles.track}>
          <motion.div
            className={meterStyles.fill}
            initial={{ width: 0 }}
            animate={{ width: `${v}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            style={{
              background: `linear-gradient(90deg, hsla(${hue},90%,55%,1), hsla(${hue},90%,40%,1))`,
            }}
          />
        </div>
        <div className={meterStyles.readout}>
          <span className={meterStyles.num}>{v}</span>
          <span className={meterStyles.suffix}>/ 100</span>
        </div>
      </div>
    </motion.div>
  );
}
