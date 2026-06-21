"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import { CHART_COLORS } from "./chartTheme";
import styles from "./ChartCard.module.css";

export default function QualityRadar({ data }) {
  const safe = Array.isArray(data) && data.length ? data : [{ metric: "Quality", value: 0, fullMark: 100 }];
  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className={styles.head}>
        <h3 className={styles.title}>Quality metrics</h3>
        <p className={styles.sub}>Radar chart across quality dimensions.</p>
      </div>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={safe} cx="50%" cy="50%" outerRadius="78%">
            <PolarGrid stroke={CHART_COLORS.grid} />
            <PolarAngleAxis dataKey="metric" tick={{ fill: CHART_COLORS.text, fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: "#111827",
                border: "1px solid rgba(148,163,184,0.18)",
                borderRadius: 12,
                color: "#F9FAFB",
              }}
            />
            <Radar name="Score" dataKey="value" stroke={CHART_COLORS.primary} fill={CHART_COLORS.primary} fillOpacity={0.35} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
