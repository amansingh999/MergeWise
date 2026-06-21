"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";
import { CHART_COLORS } from "./chartTheme";
import styles from "./ChartCard.module.css";

export default function ScoreLineChart({ data }) {
  const safe =
    Array.isArray(data) && data.length
      ? data.map((d) => ({
          name: String(d.name || d.metric || "metric"),
          score: Number(d.score ?? d.value ?? 0),
        }))
      : [{ name: "—", score: 0 }];
  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
    >
      <div className={styles.head}>
        <h3 className={styles.title}>Score breakdown</h3>
        <p className={styles.sub}>Line chart of category scores.</p>
      </div>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={safe} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
            <XAxis dataKey="name" tick={{ fill: CHART_COLORS.text, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: CHART_COLORS.text, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: "#111827",
                border: "1px solid rgba(148,163,184,0.18)",
                borderRadius: 12,
                color: "#F9FAFB",
              }}
            />
            <Line type="monotone" dataKey="score" stroke={CHART_COLORS.secondary} strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
