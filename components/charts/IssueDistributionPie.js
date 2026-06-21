"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { CHART_COLORS, SEVERITY_COLORS } from "./chartTheme";
import styles from "./ChartCard.module.css";

function colorFor(name) {
  const k = String(name).toLowerCase();
  if (SEVERITY_COLORS[k]) return SEVERITY_COLORS[k];
  return CHART_COLORS.primary;
}

export default function IssueDistributionPie({ data }) {
  const safe = Array.isArray(data) && data.length ? data : [{ name: "none", value: 1 }];
  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className={styles.head}>
        <h3 className={styles.title}>Issue distribution</h3>
        <p className={styles.sub}>Pie chart by severity / category buckets.</p>
      </div>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie dataKey="value" data={safe} innerRadius={52} outerRadius={78} paddingAngle={2}>
              {safe.map((entry, index) => (
                <Cell key={`c-${index}`} fill={colorFor(entry.name)} stroke="rgba(2,6,23,0.35)" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#111827",
                border: "1px solid rgba(148,163,184,0.18)",
                borderRadius: 12,
                color: "#F9FAFB",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
