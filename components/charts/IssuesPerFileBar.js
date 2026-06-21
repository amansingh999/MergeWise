"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import { CHART_COLORS } from "./chartTheme";
import styles from "./ChartCard.module.css";

export default function IssuesPerFileBar({ data }) {
  const safe =
    Array.isArray(data) && data.length
      ? data.map((d) => ({
          name: String(d.name || d.file || "file").slice(0, 18),
          issues: Number(d.issues ?? d.value ?? 0),
        }))
      : [{ name: "—", issues: 0 }];
  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
    >
      <div className={styles.head}>
        <h3 className={styles.title}>Issues per file</h3>
        <p className={styles.sub}>Bar chart of issue density across changed files.</p>
      </div>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={safe} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis dataKey="name" tick={{ fill: CHART_COLORS.text, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: CHART_COLORS.text, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(99,102,241,0.08)" }}
              contentStyle={{
                background: "#111827",
                border: "1px solid rgba(148,163,184,0.18)",
                borderRadius: 12,
                color: "#F9FAFB",
              }}
            />
            <Bar dataKey="issues" fill={CHART_COLORS.secondary} radius={[10, 10, 4, 4]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
