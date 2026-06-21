"use client";

import { motion } from "framer-motion";
import { formatDate } from "../../utils/format";
import { safeString } from "../../utils/format";
import styles from "./DynamicRemainder.module.css";

function isIsoDateString(s) {
  if (typeof s !== "string") return false;
  return /^\d{4}-\d{2}-\d{2}T/.test(s) && !Number.isNaN(Date.parse(s));
}

function isUrlString(s) {
  if (typeof s !== "string") return false;
  return /^https?:\/\//i.test(s);
}

function ValueCell({ label, value }) {
  if (value === undefined) return null;

  if (value === null) {
    return (
      <div className={styles.row}>
        <span className={styles.k}>{label}</span>
        <span className={styles.nullv}>null</span>
      </div>
    );
  }

  if (typeof value === "boolean") {
    return (
      <div className={styles.row}>
        <span className={styles.k}>{label}</span>
        <span className={value ? styles.badgeOk : styles.badgeOff}>
          {value ? "true" : "false"}
        </span>
      </div>
    );
  }

  if (typeof value === "number") {
    return (
      <div className={styles.row}>
        <span className={styles.k}>{label}</span>
        <span className={styles.num}>{value}</span>
      </div>
    );
  }

  if (typeof value === "string") {
    if (isUrlString(value)) {
      return (
        <div className={styles.row}>
          <span className={styles.k}>{label}</span>
          <a className={styles.link} href={value} target="_blank" rel="noreferrer">
            {value}
          </a>
        </div>
      );
    }
    if (isIsoDateString(value)) {
      return (
        <div className={styles.row}>
          <span className={styles.k}>{label}</span>
          <span className={styles.str}>{formatDate(value)}</span>
        </div>
      );
    }
    return (
      <div className={styles.row}>
        <span className={styles.k}>{label}</span>
        <span className={styles.str}>{value}</span>
      </div>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className={styles.block}>
        <div className={styles.blockTitle}>{label}</div>
        <div className={styles.nested}>
          {value.length === 0 ? (
            <span className={styles.muted}>[]</span>
          ) : (
            value.map((item, idx) => (
              <div key={`${label}-${idx}`} className={styles.arrayItem}>
                {typeof item === "object" && item !== null ? (
                  <DynamicRemainder data={item} title={`#${idx + 1}`} depth={1} />
                ) : (
                  <ValueCell label={`[${idx}]`} value={item} />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  if (typeof value === "object") {
    return (
      <div className={styles.block}>
        <div className={styles.blockTitle}>{label}</div>
        <div className={styles.nested}>
          <DynamicRemainder data={value} depth={1} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.row}>
      <span className={styles.k}>{label}</span>
      <span className={styles.str}>{safeString(value)}</span>
    </div>
  );
}

/**
 * Renders every key on `data` except those in `excludeKeys` (shallow keys only).
 */
export default function DynamicRemainder({
  data,
  excludeKeys = [],
  title = "Additional fields",
  depth = 0,
}) {
  if (!data || typeof data !== "object") return null;
  const keys = Object.keys(data).filter((k) => !excludeKeys.includes(k));
  if (!keys.length) return null;

  const content = (
    <div className={styles.grid}>
      {keys.map((k) => (
        <ValueCell key={k} label={k} value={data[k]} />
      ))}
    </div>
  );

  if (depth > 0) return content;

  return (
    <motion.section
      className={styles.section}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      aria-label={title}
    >
      <header className={styles.header}>
        <h3 className={styles.h}>{title}</h3>
        <p className={styles.sub}>
          All remaining properties from the API for this scope.
        </p>
      </header>
      {content}
    </motion.section>
  );
}
