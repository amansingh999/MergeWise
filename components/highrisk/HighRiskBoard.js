"use client";

import { asArray } from "../../utils/pick";
import { motion } from "framer-motion";
import styles from "./HighRiskBoard.module.css";

function renderValue(value) {
  if (value == null) return <span className={styles.muted}>—</span>;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean")
    return <p className={styles.p}>{String(value)}</p>;
  if (Array.isArray(value)) {
    if (!value.length) return <span className={styles.muted}>Empty list</span>;
    return (
      <ul className={styles.list}>
        {value.map((x, i) => (
          <li key={i} className={styles.li}>
            {typeof x === "string" ? x : JSON.stringify(x)}
          </li>
        ))}
      </ul>
    );
  }
  return (
    <pre className={styles.pre}>{JSON.stringify(value, null, 2)}</pre>
  );
}

export default function HighRiskBoard({ highRisk }) {
  if (!highRisk || typeof highRisk !== "object") {
    return <p className={styles.muted}>No high-risk payload.</p>;
  }

  const entries = Object.entries(highRisk).filter(([k]) => k !== "items");
  const items = asArray(highRisk.items);

  return (
    <div className={styles.wrap}>
      {items.length ? (
        <section className={styles.section} aria-label="High risk items">
          <h2 className={styles.h2}>Flagged high-risk items</h2>
          <div className={styles.grid}>
            {items.map((it, idx) => (
              <motion.article
                key={idx}
                className={styles.card}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                <h3 className={styles.cardTitle}>Item {idx + 1}</h3>
                {typeof it === "object" && it ? (
                  <div className={styles.kvGrid}>
                    {Object.keys(it).map((k) => (
                      <div key={k} className={styles.kv}>
                        <span className={styles.k}>{k}</span>
                        <div className={styles.v}>{renderValue(it[k])}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  renderValue(it)
                )}
              </motion.article>
            ))}
          </div>
        </section>
      ) : null}

      <section className={styles.section} aria-label="High risk categories">
        <h2 className={styles.h2}>Risk categories from API</h2>
        <div className={styles.grid}>
          {entries.map(([key, value], idx) => (
            <motion.article
              key={key}
              className={styles.card}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <h3 className={styles.cardTitle}>{key}</h3>
              {renderValue(value)}
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
}
