"use client";

import { useState } from "react";
import styles from "./ContextSnippetViewer.module.css";

function SnippetBlock({ snippet, defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const preview = snippet.lines.slice(0, 8);
  const hasMore = snippet.lines.length > 8;
  const visible = expanded ? snippet.lines : preview;

  return (
    <div className={styles.snippet}>
      <pre className={styles.pre}>
        {visible.map((line, i) => (
          <div
            key={i}
            className={`${styles.line} ${styles[line.type]} ${line.important ? styles.important : ""}`}
          >
            <span className={styles.prefix}>{line.type === "added" ? "+" : "-"}</span>
            <code>{line.text}</code>
          </div>
        ))}
      </pre>
      {hasMore ? (
        <button type="button" className={styles.moreBtn} onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Show less" : `Show ${snippet.lines.length - 8} more lines`}
        </button>
      ) : null}
    </div>
  );
}

export default function ContextSnippetViewer({ snippets }) {
  if (!snippets?.length) return null;

  return (
    <div className={styles.wrap}>
      <p className={styles.label}>Relevant changes</p>
      {snippets.map((s, i) => (
        <SnippetBlock key={s.id} snippet={s} defaultExpanded={i === 0} />
      ))}
    </div>
  );
}
