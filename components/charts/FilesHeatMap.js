"use client";

import { motion } from "framer-motion";
import { CHART_COLORS, SEVERITY_COLORS } from "./chartTheme";
import styles from "./ChartCard.module.css";
import heatStyles from "./FilesHeatMap.module.css";

function heatColor(n) {
  if (n <= 0) return "rgba(148,163,184,0.08)";
  if (n === 1) return "rgba(34,211,238,0.22)";
  if (n <= 3) return "rgba(99,102,241,0.35)";
  if (n <= 6) return "rgba(245,158,11,0.35)";
  return "rgba(239,68,68,0.45)";
}

export default function FilesHeatMap({ rows }) {
  const keys = ["critical", "high", "medium", "low", "info"];
  const safe = Array.isArray(rows) && rows.length ? rows : [];
  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.09 }}
    >
      <div className={styles.head}>
        <h3 className={styles.title}>Files vs issues heat map</h3>
        <p className={styles.sub}>Heat intensity by file and severity bucket.</p>
      </div>
      <div className={heatStyles.tableWrap}>
        <table className={heatStyles.table} role="grid" aria-label="Files versus severities">
          <thead>
            <tr>
              <th scope="col" className={heatStyles.thFile}>
                File
              </th>
              {keys.map((k) => (
                <th key={k} scope="col" className={heatStyles.th}>
                  {k}
                </th>
              ))}
              <th scope="col" className={heatStyles.th}>
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {safe.length ? (
              safe.map((r, idx) => (
                <tr key={`${r.file}-${idx}`}>
                  <td className={heatStyles.file}>{String(r.file || "file").slice(0, 40)}</td>
                  {keys.map((k) => (
                    <td key={k} className={heatStyles.cell}>
                      <span
                        className={heatStyles.chip}
                        style={{
                          background: heatColor(Number(r[k] || 0)),
                          borderColor: SEVERITY_COLORS[k] || CHART_COLORS.grid,
                        }}
                      >
                        {Number(r[k] || 0)}
                      </span>
                    </td>
                  ))}
                  <td className={heatStyles.cell}>
                    <span className={heatStyles.total}>{Number(r.total || 0)}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className={heatStyles.empty} colSpan={keys.length + 2}>
                  No per-file issue breakdown available yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
