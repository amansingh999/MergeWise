"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaExpandAlt, FaCompressAlt } from "react-icons/fa";
import { pickNum, pickStr } from "../../utils/pick";
import FileDiffPanel from "../diff/FileDiffPanel";
import DynamicRemainder from "../response/DynamicRemainder";
import styles from "./FileAccordion.module.css";

function fileTitle(f) {
  return pickStr(f, ["fileName", "path", "name", "filePath"], "file");
}

const KNOWN_FILE_KEYS = new Set([
  "fileName",
  "filename",
  "path",
  "name",
  "filePath",
  "language",
  "lang",
  "fileScore",
  "score",
  "status",
  "addedLines",
  "additions",
  "linesAdded",
  "deletedLines",
  "deletions",
  "linesDeleted",
  "totalChanges",
  "complexity",
  "risk",
  "issueCount",
  "issues",
  "suggestionsCount",
  "suggestions",
  "detectedIssues",
  "warnings",
  "aiExplanation",
  "explanation",
  "codeSmells",
  "bestPractices",
  "missingTests",
  "namingProblems",
  "formattingProblems",
  "performanceProblems",
  "securityVulnerabilities",
  "nullChecks",
  "unusedVariables",
  "duplicateCode",
  "oldCode",
  "newCode",
  "before",
  "after",
  "beforeCode",
  "afterCode",
  "patch",
  "quality",
  "qualityScore",
  "maintainability",
  "maintainabilityScore",
  "security",
  "securityScore",
  "performance",
  "performanceScore",
  "old",
  "new",
  "left",
  "right",
  "previous",
  "current",
  "diff",
  "unifiedDiff",
]);

function ListBlock({ title, items }) {
  const arr = Array.isArray(items) ? items : [];
  if (!arr.length) return null;
  return (
    <div className={styles.block}>
      <h4 className={styles.h4}>{title}</h4>
      <ul className={styles.list}>
        {arr.map((x, i) => (
          <li key={i} className={styles.li}>
            {typeof x === "string" || typeof x === "number" || typeof x === "boolean"
              ? String(x)
              : typeof x === "object" && x !== null
                ? Object.entries(x)
                    .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
                    .join(" · ")
                : JSON.stringify(x)}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Badge({ children, tone = "neutral" }) {
  return <span className={`${styles.badge} ${styles[`tone_${tone}`]}`}>{children}</span>;
}

export default function FileAccordion({ file, index }) {
  const [open, setOpen] = useState(index === 0);
  const [diffOpen, setDiffOpen] = useState(false);
  const [full, setFull] = useState(false);

  const title = fileTitle(file);
  const language = pickStr(file, ["language", "lang"], "");
  const fileScore = pickNum(file, ["fileScore", "score"]);
  const status = pickStr(file, ["status", "state"], "");
  const added = pickNum(file, ["addedLines", "additions", "linesAdded"]);
  const deleted = pickNum(file, ["deletedLines", "deletions", "linesDeleted"]);
  const totalChanges = pickNum(file, ["totalChanges", "changes", "changedLines"]);
  const complexity = pickNum(file, ["complexity", "complexityScore"]);
  const risk = pickStr(file, ["risk", "riskLevel", "severity"], "");
  const issueCount = pickNum(file, ["issueCount", "issues", "issuesCount"]);
  const suggestionsCount = pickNum(file, ["suggestionsCount", "suggestionCount"]);

  return (
    <motion.article
      layout
      className={styles.card}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <button
        type="button"
        className={styles.head}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`file-panel-${index}`}
        id={`file-head-${index}`}
      >
        <div className={styles.headLeft}>
          <span className={styles.idx}>#{index + 1}</span>
          <div className={styles.headText}>
            <div className={styles.fileName}>{title}</div>
            <div className={styles.meta}>
              {language ? <span>{language}</span> : null}
              {status ? <Badge tone="info">{status}</Badge> : null}
              {risk ? <Badge tone="danger">{risk}</Badge> : null}
            </div>
          </div>
        </div>
        <div className={styles.headRight}>
          <div className={styles.miniStat}>
            <span className={styles.miniLabel}>Score</span>
            <span className={styles.miniVal}>{fileScore || "—"}</span>
          </div>
          <div className={styles.miniStat}>
            <span className={styles.miniLabel}>Issues</span>
            <span className={styles.miniVal}>{issueCount}</span>
          </div>
          <FaChevronDown className={open ? styles.chevOpen : styles.chev} aria-hidden />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="panel"
            id={`file-panel-${index}`}
            role="region"
            aria-labelledby={`file-head-${index}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className={styles.panel}
          >
            <div className={styles.grid}>
              <div className={styles.kv}>
                <span className={styles.k}>Added lines</span>
                <span className={styles.v}>{added}</span>
              </div>
              <div className={styles.kv}>
                <span className={styles.k}>Deleted lines</span>
                <span className={styles.v}>{deleted}</span>
              </div>
              <div className={styles.kv}>
                <span className={styles.k}>Total changes</span>
                <span className={styles.v}>{totalChanges}</span>
              </div>
              <div className={styles.kv}>
                <span className={styles.k}>Complexity</span>
                <span className={styles.v}>{complexity}</span>
              </div>
              <div className={styles.kv}>
                <span className={styles.k}>Suggestions</span>
                <span className={styles.v}>{suggestionsCount}</span>
              </div>
            </div>

            <div className={styles.badgesRow} aria-label="File quality badges">
              <Badge tone="purple">File score: {fileScore || "—"}</Badge>
              <Badge tone="danger">Risk: {risk || "—"}</Badge>
              <Badge tone="success">Quality: {pickStr(file, ["quality", "qualityScore"], "—")}</Badge>
              <Badge tone="info">Maintainability: {pickStr(file, ["maintainability", "maintainabilityScore"], "—")}</Badge>
              <Badge tone="warning">Security: {pickStr(file, ["security", "securityScore"], "—")}</Badge>
              <Badge tone="purple">Performance: {pickStr(file, ["performance", "performanceScore"], "—")}</Badge>
            </div>

            <div className={styles.complexity}>
              <div className={styles.complexityTop}>
                <span>Complexity meter</span>
                <span>{complexity || 0}</span>
              </div>
              <div className={styles.meterTrack}>
                <div
                  className={styles.meterFill}
                  style={{ width: `${Math.min(100, Number(complexity) || 0)}%` }}
                />
              </div>
            </div>

            <ListBlock title="Suggestions" items={file.suggestions} />
            <ListBlock title="Detected issues" items={file.detectedIssues} />
            <ListBlock title="Warnings" items={file.warnings} />
            <ListBlock title="Code smells" items={file.codeSmells} />
            <ListBlock title="Best practices" items={file.bestPractices} />
            <ListBlock title="Missing tests" items={file.missingTests} />
            <ListBlock title="Naming problems" items={file.namingProblems} />
            <ListBlock title="Formatting problems" items={file.formattingProblems} />
            <ListBlock title="Performance problems" items={file.performanceProblems} />
            <ListBlock title="Security vulnerabilities" items={file.securityVulnerabilities} />
            <ListBlock title="Null checks" items={file.nullChecks} />
            <ListBlock title="Unused variables" items={file.unusedVariables} />
            <ListBlock title="Duplicate code" items={file.duplicateCode} />

            {(file.aiExplanation || file.explanation) && (
              <div className={styles.block}>
                <h4 className={styles.h4}>AI explanation</h4>
                <p className={styles.p}>{String(file.aiExplanation || file.explanation)}</p>
              </div>
            )}

            <div className={styles.diffToolbar}>
              <button type="button" className={styles.linkBtn} onClick={() => setDiffOpen((v) => !v)}>
                {diffOpen ? "Hide diff" : "Show before / after diff"}
              </button>
              <button type="button" className={styles.iconBtn} onClick={() => setFull((v) => !v)} aria-pressed={full}>
                {full ? <FaCompressAlt /> : <FaExpandAlt />}
                <span className={styles.srOnly}>Toggle fullscreen diff</span>
              </button>
            </div>

            {diffOpen ? (
              <FileDiffPanel file={file} fullscreen={full} onExitFullscreen={() => setFull(false)} />
            ) : null}

            <DynamicRemainder
              data={file}
              excludeKeys={Array.from(KNOWN_FILE_KEYS)}
              title="Additional file fields from API"
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  );
}
