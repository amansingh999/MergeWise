"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { pickStr, pickNum } from "../../utils/pick";
import { exportCsv } from "../../utils/exportReport";
import styles from "./IssuesTable.module.css";

function issueSeverity(i) {
  return pickStr(i, ["severity", "level", "riskLevel"], "—");
}

function issueCategory(i) {
  return pickStr(i, ["category", "type", "kind"], "—");
}

function issueMessage(i) {
  return pickStr(i, ["message", "description", "text", "detail"], "—");
}

function issueFile(i) {
  return pickStr(i, ["file", "path", "filePath", "filename"], "—");
}

function issueLine(i) {
  return pickNum(i, ["line", "lineNumber", "startLine"], 0);
}

function issueSuggestion(i) {
  return pickStr(i, ["suggestion", "suggestedFix", "fix", "recommendation"], "—");
}

function issueConfidence(i) {
  const v = pickStr(i, ["confidence", "score", "probability"], "");
  return v || "—";
}

function issueRule(i) {
  return pickStr(i, ["rule", "ruleId", "code"], "—");
}

function issueStatus(i) {
  return pickStr(i, ["status", "state"], "—");
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
        issueMessage(i),
        issueFile(i),
        issueSuggestion(i),
        issueRule(i),
        issueStatus(i),
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
      if (sortKey === "line") return issueLine(a) - issueLine(b);
      return issueMessage(a).localeCompare(issueMessage(b));
    });

    return out;
  }, [rows, q, sev, file, cat, sortKey]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  function exportRows() {
    const data = filtered.map((i) => ({
      severity: issueSeverity(i),
      category: issueCategory(i),
      message: issueMessage(i),
      file: issueFile(i),
      line: issueLine(i) || "",
      suggestion: issueSuggestion(i),
      confidence: issueConfidence(i),
      rule: issueRule(i),
      status: issueStatus(i),
    }));
    exportCsv(`mergewise-issues-${Date.now()}.csv`, data);
  }

  return (
    <section className={styles.section} aria-labelledby="issues-title">
      <div className={styles.head}>
        <div>
          <h2 id="issues-title" className={styles.title}>
            Issue analysis
          </h2>
          <p className={styles.sub}>
            Table view with filters, sorting, pagination, and CSV export.
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
            placeholder="Search message, rule, file…"
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
            <option value="message">Message</option>
          </select>
        </label>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Severity</th>
              <th scope="col">Category</th>
              <th scope="col">Message</th>
              <th scope="col">File</th>
              <th scope="col">Line</th>
              <th scope="col">Suggestion</th>
              <th scope="col">Confidence</th>
              <th scope="col">Rule</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length ? (
              pageRows.map((i, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(0.12, idx * 0.015) }}
                >
                  <td>
                    <span className={styles.sev}>{issueSeverity(i)}</span>
                  </td>
                  <td>{issueCategory(i)}</td>
                  <td className={styles.msg}>{issueMessage(i)}</td>
                  <td className={styles.file}>{issueFile(i)}</td>
                  <td>{issueLine(i) || "—"}</td>
                  <td className={styles.msg}>{issueSuggestion(i)}</td>
                  <td>{issueConfidence(i)}</td>
                  <td>{issueRule(i)}</td>
                  <td>{issueStatus(i)}</td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className={styles.empty}>
                  No issues match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
