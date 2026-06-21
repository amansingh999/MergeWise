"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";
import { CHART_COLORS } from "./chartTheme";
import styles from "./ChartCard.module.css";

export default function LinesStackedBar({ data }) {
  const safe =
    Array.isArray(data) && data.length
      ? data
      : [{ name: "—", added: 0, deleted: 0 }];
  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.11 }}
    >
      <div className={styles.head}>
        <h3 className={styles.title}>Added vs deleted lines</h3>
        <p className={styles.sub}>Stacked bar comparison per file.</p>
      </div>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={safe} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis dataKey="name" tick={{ fill: CHART_COLORS.text, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: CHART_COLORS.text, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: "#111827",
                border: "1px solid rgba(148,163,184,0.18)",
                borderRadius: 12,
                color: "#F9FAFB",
              }}
            />
            <Legend />
            <Bar dataKey="added" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
            <Bar dataKey="deleted" stackId="a" fill="#EF4444" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
