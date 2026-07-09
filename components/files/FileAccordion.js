"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";
import ContextSnippetViewer from "../diff/ContextSnippetViewer";
import ui from "../ui/ui.module.css";
import styles from "./FileAccordion.module.css";

function statusClass(status) {
  if (status === "Critical") return ui.badgeDanger;
  if (status === "Warning") return ui.badgeWarning;
  return ui.badgeSuccess;
}

function severityClass(sev) {
  const s = sev.toLowerCase();
  if (s.includes("crit") || s.includes("high")) return styles.sevHigh;
  if (s.includes("med")) return styles.sevMed;
  return styles.sevLow;
}

function FileIssue({ issue }) {
  return (
    <div className={styles.issue}>
      <div className={styles.issueHead}>
        <span className={`${styles.sevPill} ${severityClass(issue.severity)}`}>
          {issue.severity}
        </span>
        {issue.confidence ? (
          <span className={styles.confidence}>{issue.confidence}%</span>
        ) : null}
      </div>
      <p className={styles.issueTitle}>{issue.title}</p>
      {issue.explanation ? <p className={styles.issueDesc}>{issue.explanation}</p> : null}
      {issue.suggestion ? (
        <p className={styles.suggestion}>
          <strong>Suggestion:</strong> {issue.suggestion}
        </p>
      ) : null}
      {issue.beforeAfter ? (
        <pre className={styles.codeFix}>{issue.beforeAfter}</pre>
      ) : null}
    </div>
  );
}

export default function FileAccordion({ file, index }) {
  const [open, setOpen] = useState(index === 0);
  const shortName = file.name.split("/").pop() || file.name;

  return (
    <article className={`${ui.card} ${styles.card}`}>
      <button
        type="button"
        className={styles.head}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className={styles.headMain}>
          <div className={styles.nameRow}>
            <span className={styles.fileName}>{shortName}</span>
            <span className={statusClass(file.statusBadge)}>{file.statusBadge}</span>
          </div>
          <div className={styles.chips}>
            <span>Score {file.score}</span>
            <span>{file.issueCount} issues</span>
            <span>{file.suggestionsCount} suggestions</span>
            {file.additions > 0 ? (
              <span className={styles.add}>+{file.additions}</span>
            ) : null}
            {file.deletions > 0 ? (
              <span className={styles.del}>-{file.deletions}</span>
            ) : null}
          </div>
        </div>
        <FaChevronDown className={open ? styles.chevOpen : styles.chev} aria-hidden />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={styles.panel}
          >
            {file.issues.length ? (
              <div className={styles.issues}>
                {file.issues.map((issue) => (
                  <FileIssue key={issue.id} issue={issue} />
                ))}
              </div>
            ) : (
              <p className={ui.muted}>No issues in this file.</p>
            )}
            {file.showPatch ? <ContextSnippetViewer snippets={file.snippets} /> : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  );
}
