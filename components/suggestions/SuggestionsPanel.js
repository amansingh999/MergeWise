"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { pickStr } from "../../utils/pick";
import styles from "./SuggestionsPanel.module.css";

const GROUP_ORDER = [
  "performance",
  "security",
  "readability",
  "maintainability",
  "testing",
  "architecture",
  "documentation",
  "other",
];

function groupOf(s) {
  const g = pickStr(s, ["group", "category", "type", "bucket"], "other").toLowerCase();
  if (GROUP_ORDER.includes(g)) return g;
  if (g.includes("perf")) return "performance";
  if (g.includes("sec")) return "security";
  if (g.includes("read")) return "readability";
  if (g.includes("maint")) return "maintainability";
  if (g.includes("test")) return "testing";
  if (g.includes("arch")) return "architecture";
  if (g.includes("doc")) return "documentation";
  return "other";
}

function SuggestionCard({ s, i }) {
  const priority = pickStr(s, ["priority", "severity", "rank"], "—");
  const impact = pickStr(s, ["estimatedImpact", "impact"], "—");
  const ttf = pickStr(s, ["timeToFix", "effort", "eta"], "—");
  const explanation = pickStr(s, ["explanation", "message", "description", "text"], "—");
  const example = pickStr(s, ["example", "sample", "snippet"], "");
  const code = pickStr(s, ["codeSnippet", "code", "patch"], "");

  return (
    <motion.article
      className={styles.card}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(0.12, i * 0.02) }}
      whileHover={{ y: -3 }}
    >
      <div className={styles.row}>
        <span className={styles.badge}>{priority}</span>
        <span className={styles.meta}>Impact: {impact}</span>
        <span className={styles.meta}>Time to fix: {ttf}</span>
      </div>
      <p className={styles.p}>{explanation}</p>
      {example ? (
        <div className={styles.block}>
          <div className={styles.h}>Example</div>
          <pre className={styles.pre}>{example}</pre>
        </div>
      ) : null}
      {code ? (
        <div className={styles.block}>
          <div className={styles.h}>Code snippet</div>
          <pre className={styles.pre}>{code}</pre>
        </div>
      ) : null}
      <DynamicSuggestionRemainder suggestion={s} />
    </motion.article>
  );
}

function DynamicSuggestionRemainder({ suggestion }) {
  const keys = Object.keys(suggestion || {});
  const exclude = new Set([
    "priority",
    "severity",
    "rank",
    "estimatedImpact",
    "impact",
    "timeToFix",
    "effort",
    "eta",
    "explanation",
    "message",
    "description",
    "text",
    "example",
    "sample",
    "snippet",
    "codeSnippet",
    "code",
    "patch",
    "group",
    "category",
    "type",
    "bucket",
  ]);
  const rest = keys.filter((k) => !exclude.has(k));
  if (!rest.length) return null;
  return (
    <div className={styles.more}>
      {rest.map((k) => (
        <div key={k} className={styles.kv}>
          <span className={styles.k}>{k}</span>
          <span className={styles.v}>
            {typeof suggestion[k] === "object"
              ? JSON.stringify(suggestion[k])
              : String(suggestion[k])}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function SuggestionsPanel({ suggestions }) {
  const grouped = useMemo(() => {
    const list = Array.isArray(suggestions) ? suggestions : [];
    const map = {};
    for (const g of GROUP_ORDER) map[g] = [];
    for (const s of list) {
      const g = groupOf(s);
      map[g].push(s);
    }
    return map;
  }, [suggestions]);

  return (
    <section className={styles.section} aria-labelledby="suggestions-title">
      <h2 id="suggestions-title" className={styles.title}>
        Suggestions
      </h2>
      <p className={styles.sub}>
        Grouped by performance, security, readability, maintainability, testing,
        architecture, and documentation — plus any additional fields from the API.
      </p>

      {GROUP_ORDER.map((g) => (
        <div key={g} className={styles.group}>
          <h3 className={styles.groupTitle}>{g}</h3>
          {grouped[g]?.length ? (
            <div className={styles.grid}>
              {grouped[g].map((s, i) => (
                <SuggestionCard key={`${g}-${i}`} s={s} i={i} />
              ))}
            </div>
          ) : (
            <p className={styles.empty}>No suggestions in this bucket.</p>
          )}
        </div>
      ))}
    </section>
  );
}
