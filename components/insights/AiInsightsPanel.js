"use client";

import { motion } from "framer-motion";
import { pickStr, pickNum } from "../../utils/pick";
import styles from "./AiInsightsPanel.module.css";

function Verdict({ value }) {
  const v =
    typeof value === "boolean" ? (value ? "yes" : "no") : String(value ?? "—").toLowerCase();
  let tone = styles.neutral;
  if (v.includes("yes") || v.includes("approve")) tone = styles.ok;
  if (v.includes("no") || v.includes("block")) tone = styles.bad;
  if (v.includes("need")) tone = styles.warn;
  return <span className={`${styles.verdict} ${tone}`}>{String(value ?? "—")}</span>;
}

export default function AiInsightsPanel({ ai, raw }) {
  const topProblems = ai?.topProblems ?? raw?.topProblems;
  const quickWins = ai?.quickWins ?? raw?.quickWins;
  const filesNeedingAttention = ai?.filesNeedingAttention ?? raw?.filesNeedingAttention;
  const riskSummary = pickStr(ai || raw || {}, [
    "riskSummary",
    "riskOverview",
    "risk",
  ]);
  const overallRecommendation = pickStr(ai || raw || {}, [
    "overallRecommendation",
    "recommendation",
  ]);
  const mergeReadinessScore = pickNum(ai || raw || {}, [
    "mergeReadinessScore",
    "readinessScore",
  ]);
  const mergeConfidence = pickNum(ai || raw || {}, [
    "mergeConfidence",
    "confidenceScore",
  ]);
  const shouldMerge = pickStr(ai || raw || {}, ["shouldMerge", "mergeVerdict", "verdict"]);

  const cards = [
    { title: "Top problems", content: topProblems },
    { title: "Quick wins", content: quickWins },
    { title: "Files needing attention", content: filesNeedingAttention },
    { title: "Risk summary", text: riskSummary },
    { title: "Overall recommendation", text: overallRecommendation },
    {
      title: "Merge readiness score",
      text: mergeReadinessScore ? String(mergeReadinessScore) : "—",
    },
    {
      title: "Merge confidence",
      text: mergeConfidence ? String(mergeConfidence) : "—",
    },
    { title: "Should merge?", content: shouldMerge },
  ];

  function renderContent(c) {
    if (c.text) return <p className={styles.p}>{c.text}</p>;
    if (Array.isArray(c.content)) {
      if (!c.content.length) return <p className={styles.muted}>—</p>;
      return (
        <ul className={styles.list}>
          {c.content.map((x, i) => (
            <li key={i} className={styles.li}>
              {typeof x === "string" ? x : JSON.stringify(x)}
            </li>
          ))}
        </ul>
      );
    }
    if (c.title === "Should merge?") {
      return <Verdict value={c.content} />;
    }
    if (c.content == null || c.content === "") return <p className={styles.muted}>—</p>;
    return <p className={styles.p}>{String(c.content)}</p>;
  }

  return (
    <section className={styles.section} aria-labelledby="insights-title">
      <h2 id="insights-title" className={styles.h2}>
        AI insights
      </h2>
      <p className={styles.sub}>
        Executive signals derived from the analyzer — including merge readiness and
        confidence.
      </p>
      <div className={styles.grid}>
        {cards.map((c, i) => (
          <motion.div
            key={c.title}
            className={styles.card}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -3 }}
          >
            <h3 className={styles.cardTitle}>{c.title}</h3>
            {renderContent(c)}
          </motion.div>
        ))}
      </div>

      {ai && typeof ai === "object" ? (
        <div className={styles.extra}>
          <h3 className={styles.h3}>Additional AI insight fields</h3>
          <div className={styles.kvGrid}>
            {Object.keys(ai)
              .filter(
                (k) =>
                  ![
                    "topProblems",
                    "quickWins",
                    "filesNeedingAttention",
                    "riskSummary",
                    "riskOverview",
                    "overallRecommendation",
                    "recommendation",
                    "mergeReadinessScore",
                    "readinessScore",
                    "mergeConfidence",
                    "confidenceScore",
                    "shouldMerge",
                    "mergeVerdict",
                    "verdict",
                  ].includes(k),
              )
              .map((k) => (
                <div key={k} className={styles.kv}>
                  <span className={styles.k}>{k}</span>
                  <span className={styles.v}>
                    {typeof ai[k] === "object" ? JSON.stringify(ai[k]) : String(ai[k])}
                  </span>
                </div>
              ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
