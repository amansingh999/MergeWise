"use client";

import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import styles from "./ChartCard.module.css";

export default function PrScoreGauge({ score }) {
  const v = Math.max(0, Math.min(100, Number(score) || 0));
  const data = [{ name: "PR", value: v, fill: "#6366F1" }];
  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className={styles.head}>
        <h3 className={styles.title}>PR score gauge</h3>
        <p className={styles.sub}>Radial gauge for overall PR score (0–100).</p>
      </div>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="68%"
            outerRadius="100%"
            data={data}
            startAngle={220}
            endAngle={-40}
            cx="50%"
            cy="50%"
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar background={{ fill: "rgba(148,163,184,0.12)" }} dataKey="value" cornerRadius={999} />
            <Tooltip
              formatter={(value) => [`${value}`, "Score"]}
              contentStyle={{
                background: "#111827",
                border: "1px solid rgba(148,163,184,0.18)",
                borderRadius: 12,
                color: "#F9FAFB",
              }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
