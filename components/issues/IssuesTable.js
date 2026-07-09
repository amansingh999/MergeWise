"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";
import { pickStr, pickNum } from "../../utils/pick";
import { exportCsv } from "../../utils/exportReport";
import styles from "./IssuesTable.module.css";

function issueId(i) {
  return pickStr(i, ["id"], "");
}

function issueSeverity(i) {
  return pickStr(i, ["severity", "level", "riskLevel"], "—");
}

function issueCategory(i) {
  return pickStr(i, ["category", "type", "kind"], "—");
}

function issueTitle(i) {
  return pickStr(i, ["title", "message", "text"], "—");
}

function issueDescription(i) {
  return pickStr(i, ["description", "detail"], "");
}

function issueFile(i) {
  return pickStr(i, ["file", "path", "filePath", "filename"], "—");
}

function issueLine(i) {
  const n = pickNum(i, ["line", "lineNumber", "startLine"], 0);
  return n > 0 ? n : null;
}

function issueFix(i) {
  return pickStr(i, [
    "fixRecommendation",
    "suggestion",
    "suggestedFix",
    "fix",
    "recommendation",
  ], "—");
}

function issueProductionImpact(i) {
  return pickStr(i, ["productionImpact", "impact"], "");
}

function issueFixedExample(i) {
  return pickStr(i, ["fixedCodeExample", "fixedExample", "exampleFix"], "");
}

function issueConfidence(i) {
  const n = pickNum(i, ["confidenceScore", "confidence"], NaN);
  if (Number.isFinite(n)) return `${n}%`;
  const s = pickStr(i, ["score", "probability"], "");
  return s || "—";
}

function severityClass(sev) {
  const s = sev.toLowerCase();
  if (s.includes("crit")) return styles.sevCritical;
  if (s.includes("high")) return styles.sevHigh;
  if (s.includes("med")) return styles.sevMedium;
  if (s.includes("low")) return styles.sevLow;
  return styles.sevInfo;
}

function IssueCard({ issue, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const sev = issueSeverity(issue);
  const title = issueTitle(issue);
  const description = issueDescription(issue);
  const fix = issueFix(issue);
  const impact = issueProductionImpact(issue);
  const example = issueFixedExample(issue);

  return (
    <article className={styles.card}>
      <button
        type="button"
        className={styles.cardHead}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className={styles.cardMain}>
          <span className={`${styles.sev} ${severityClass(sev)}`}>{sev}</span>
          <span className={styles.cat}>{issueCategory(issue)}</span>
          <h3 className={styles.cardTitle}>{title}</h3>
          <div className={styles.cardMeta}>
            <span className={styles.file} title={issueFile(issue)}>
              {issueFile(issue)}
            </span>
            {issueLine(issue) ? <span>Line {issueLine(issue)}</span> : null}
            <span>Confidence {issueConfidence(issue)}</span>
          </div>
        </div>
        <FaChevronDown className={open ? styles.chevOpen : styles.chev} aria-hidden />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={styles.cardBody}
          >
            {description && description !== title ? (
              <div className={styles.field}>
                <span className={styles.fieldK}>Description</span>
                <p className={styles.fieldV}>{description}</p>
              </div>
            ) : null}
            {impact ? (
              <div className={styles.field}>
                <span className={styles.fieldK}>Production impact</span>
                <p className={styles.fieldV}>{impact}</p>
              </div>
            ) : null}
            {fix && fix !== "—" ? (
              <div className={styles.field}>
                <span className={styles.fieldK}>Fix recommendation</span>
                <p className={styles.fieldV}>{fix}</p>
              </div>
            ) : null}
            {example ? (
              <div className={styles.field}>
                <span className={styles.fieldK}>Fixed code example</span>
                <pre className={styles.codeEx}>{example}</pre>
              </div>
            ) : null}
            {issueId(issue) ? (
              <div className={styles.fieldId}>ID: {issueId(issue)}</div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  );
}

export default function IssuesTable({ issues }) {
  const rows = useMemo(() => (Array.isArray(issues) ? issues : []), [issues]);

  const [q, setQ] = useState("");
  const [sev, setSev] = useState("all");
  const [file, setFile] = useState("all");
  const [cat, setCat] = useState("all");
  const [sortKey, setSortKey] = useState("severity");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const files = useMemo(() => {
    const s = new Set();
    for (const i of rows) {
      const f = issueFile(i);
      if (f && f !== "—") s.add(f);
    }
    return ["all", ...Array.from(s).sort()];
  }, [rows]);

  const cats = useMemo(() => {
    const s = new Set();
    for (const i of rows) {
      const c = issueCategory(i);
      if (c && c !== "—") s.add(c);
    }
    return ["all", ...Array.from(s).sort()];
  }, [rows]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    let out = rows.filter((i) => {
      if (sev !== "all" && issueSeverity(i).toLowerCase() !== sev.toLowerCase())
        return false;
      if (file !== "all" && issueFile(i) !== file) return false;
      if (cat !== "all" && issueCategory(i) !== cat) return false;
      if (!ql) return true;
      const hay = [
        issueSeverity(i),
        issueCategory(i),
        issueTitle(i),
        issueDescription(i),
        issueFile(i),
        issueFix(i),
        issueProductionImpact(i),
        issueId(i),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(ql);
    });

    const rankSev = (s) => {
      const x = s.toLowerCase();
      if (x.includes("crit")) return 0;
      if (x.includes("high")) return 1;
      if (x.includes("med") || x.includes("warn")) return 2;
      if (x.includes("low")) return 3;
      return 4;
    };

    out = [...out].sort((a, b) => {
      if (sortKey === "severity")
        return rankSev(issueSeverity(a)) - rankSev(issueSeverity(b));
      if (sortKey === "file") return issueFile(a).localeCompare(issueFile(b));
      if (sortKey === "line") return (issueLine(a) || 0) - (issueLine(b) || 0);
      return issueTitle(a).localeCompare(issueTitle(b));
    });

    return out;
  }, [rows, q, sev, file, cat, sortKey]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  function exportRows() {
    const data = filtered.map((i) => ({
      id: issueId(i),
      severity: issueSeverity(i),
      category: issueCategory(i),
      title: issueTitle(i),
      description: issueDescription(i),
      file: issueFile(i),
      line: issueLine(i) || "",
      fixRecommendation: issueFix(i),
      productionImpact: issueProductionImpact(i),
      fixedCodeExample: issueFixedExample(i),
      confidenceScore: issueConfidence(i),
    }));
    exportCsv(`mergewise-issues-${Date.now()}.csv`, data);
  }

  return (
    <section className={styles.section} aria-labelledby="issues-title">
      <div className={styles.head}>
        <div>
          <h2 id="issues-title" className={styles.title}>
            Review issues
          </h2>
          <p className={styles.sub}>
            {rows.length} issues from the API — expand each card for full details including
            production impact and fix recommendations.
          </p>
        </div>
        <button type="button" className={styles.export} onClick={exportRows}>
          Export CSV
        </button>
      </div>

      <div className={styles.filters}>
        <label className={styles.lbl}>
          Search
          <input
            className={styles.inp}
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            placeholder="Search title, file, category…"
            aria-label="Search issues"
          />
        </label>
        <label className={styles.lbl}>
          Severity
          <select
            className={styles.inp}
            value={sev}
            onChange={(e) => {
              setPage(1);
              setSev(e.target.value);
            }}
            aria-label="Filter by severity"
          >
            <option value="all">All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="info">Info</option>
          </select>
        </label>
        <label className={styles.lbl}>
          File
          <select
            className={styles.inp}
            value={file}
            onChange={(e) => {
              setPage(1);
              setFile(e.target.value);
            }}
            aria-label="Filter by file"
          >
            {files.map((f) => (
              <option key={f} value={f}>
                {f === "all" ? "All files" : f}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.lbl}>
          Category
          <select
            className={styles.inp}
            value={cat}
            onChange={(e) => {
              setPage(1);
              setCat(e.target.value);
            }}
            aria-label="Filter by category"
          >
            {cats.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All categories" : c}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.lbl}>
          Sort by
          <select
            className={styles.inp}
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            aria-label="Sort issues"
          >
            <option value="severity">Severity</option>
            <option value="file">File</option>
            <option value="line">Line</option>
            <option value="message">Title</option>
          </select>
        </label>
      </div>

      <div className={styles.cards}>
        {pageRows.length ? (
          pageRows.map((issue, idx) => (
            <IssueCard
              key={issueId(issue) || `${issueFile(issue)}-${idx}`}
              issue={issue}
              defaultOpen={idx === 0 && page === 1}
            />
          ))
        ) : (
          <p className={styles.empty}>No issues match the current filters.</p>
        )}
      </div>

      <div className={styles.pager}>
        <button
          type="button"
          className={styles.pageBtn}
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Previous
        </button>
        <span className={styles.pageInfo}>
          Page {page} / {pages} — {filtered.length} issues
        </span>
        <button
          type="button"
          className={styles.pageBtn}
          disabled={page >= pages}
          onClick={() => setPage((p) => Math.min(pages, p + 1))}
        >
          Next
        </button>
      </div>
    </section>
  );
}
