"use client";

import ui from "../ui/ui.module.css";
import styles from "./HighRiskBoard.module.css";

function FindingCard({ issue }) {
  return (
    <article className={`${ui.card} ${styles.card}`}>
      <div className={styles.cardHead}>
        <span className={`${styles.sev} ${styles[`sev_${issue.severity.toLowerCase()}`]}`}>
          {issue.severity}
        </span>
        {issue.category ? <span className={styles.cat}>{issue.category}</span> : null}
      </div>
      <h3 className={styles.title}>{issue.title}</h3>
      {issue.explanation ? <p className={styles.desc}>{issue.explanation}</p> : null}
      {issue.suggestion ? (
        <p className={styles.fix}>
          <strong>Fix:</strong> {issue.suggestion}
        </p>
      ) : null}
    </article>
  );
}

export default function HighRiskBoard({ findings }) {
  if (!findings?.length) {
    return <p className={ui.muted}>No high or medium risk findings in this review.</p>;
  }

  return (
    <div className={styles.grid}>
      {findings.map((issue) => (
        <FindingCard key={issue.id} issue={issue} />
      ))}
    </div>
  );
}
