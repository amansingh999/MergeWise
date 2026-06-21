"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { STORAGE_KEYS } from "../../constants/storage";
import { REVIEW_ROOT_EXCLUDE } from "../../constants/reviewRootExclude";
import { normalizeReviewResponse } from "../../utils/normalizeReview";
import { formatDate, formatDuration, gradeFromScore } from "../../utils/format";
import { pickNum, pickStr } from "../../utils/pick";
import { exportJson, exportCsv, exportPrintableReport } from "../../utils/exportReport";
import { useSettings } from "../../hooks/useSettings";
import DashboardCharts from "../charts/DashboardCharts";
import FileAccordion from "../files/FileAccordion";
import IssuesTable from "../issues/IssuesTable";
import SuggestionsPanel from "../suggestions/SuggestionsPanel";
import AiInsightsPanel from "../insights/AiInsightsPanel";
import DynamicRemainder from "../response/DynamicRemainder";
import styles from "./DashboardView.module.css";

function Stat({ label, value, delay = 0 }) {
  return (
    <motion.div
      className={styles.stat}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -3 }}
    >
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
    </motion.div>
  );
}

function EmptyDashboard() {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyGlow} aria-hidden />
      <h1 className={styles.emptyTitle}>Paste a GitHub Pull Request URL to begin.</h1>
      <p className={styles.emptySub}>
        Run an analysis from the home page — we will hydrate this dashboard with live API
        data.
      </p>
      <Link className={styles.emptyCta} href="/">
        Go to analyzer
      </Link>
    </div>
  );
}

export default function DashboardView() {
  const { settings } = useSettings();
  const reduce = !settings.animations;

  const [payload, setPayload] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEYS.lastReview);
      if (!raw) {
        setPayload(null);
        return;
      }
      setPayload(JSON.parse(raw));
    } catch {
      setPayload(null);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", Boolean(settings.highContrast));
  }, [settings.highContrast]);

  const model = useMemo(() => {
    if (!payload?.apiResponse) return null;
    return normalizeReviewResponse(payload.apiResponse);
  }, [payload]);

  const riskValue = useMemo(() => {
    if (!model) return 0;
    const direct = pickNum(model.raw, ["riskScore", "overallRisk", "risk"]);
    if (direct) return Math.min(100, direct);
    const hi = model.summary.highRiskFindings || 0;
    const med = model.summary.mediumFindings || 0;
    const low = model.summary.lowFindings || 0;
    return Math.min(100, hi * 12 + med * 4 + low * 1);
  }, [model]);

  if (!payload || !model) {
    return <EmptyDashboard />;
  }

  const { summary, raw, envelope, files, issues, suggestions, charts, highRisk, aiInsights } =
    model;
  const grade = summary.overallGrade || gradeFromScore(summary.prScore);

  function exportFullJson() {
    exportJson(`mergewise-report-${Date.now()}.json`, payload.apiResponse);
    toast.success("JSON exported");
  }

  function exportIssuesCsv() {
    const rows = issues.map((i) => ({
      severity: pickStr(i, ["severity", "level"], ""),
      category: pickStr(i, ["category", "type"], ""),
      message: pickStr(i, ["message", "description"], ""),
      file: pickStr(i, ["file", "path"], ""),
      line: pickNum(i, ["line", "lineNumber"], ""),
    }));
    exportCsv(`mergewise-issues-${Date.now()}.csv`, rows);
    toast.success("CSV exported");
  }

  const motionProps = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.35 },
      };

  return (
    <div className={`${styles.page} print-area`}>
      <motion.header className={styles.hero} {...motionProps}>
        <div className={styles.heroTop}>
          <div className={styles.scoreCol}>
            <div className={styles.scoreRing} aria-label={`Pull request score ${summary.prScore}`}>
              <svg viewBox="0 0 120 120" className={styles.scoreSvg}>
                <defs>
                  <linearGradient id="mwScoreGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#22D3EE" />
                  </linearGradient>
                </defs>
                <circle cx="60" cy="60" r="52" stroke="rgba(148,163,184,0.14)" strokeWidth="10" fill="none" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  stroke="url(#mwScoreGrad)"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={`${(summary.prScore / 100) * 326} 326`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className={styles.scoreCenter}>
                <span className={styles.scoreNum}>{summary.prScore || "—"}</span>
                <span className={styles.scoreLbl}>PR score</span>
              </div>
            </div>
            <div className={styles.grade}>
              <span className={styles.gradeLbl}>Overall grade</span>
              <span className={styles.gradeVal}>{grade}</span>
            </div>
          </div>

          <div className={styles.heroMain}>
            <div className={styles.repoRow}>
              {summary.repositoryLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className={styles.avatar}
                  src={summary.repositoryLogo}
                  alt=""
                  width={44}
                  height={44}
                />
              ) : (
                <div className={styles.avatarPh} aria-hidden />
              )}
              <div className={styles.repoText}>
                <p className={styles.repo}>{summary.repository || "Repository"}</p>
                <h1 className={styles.title}>
                  {summary.prTitle || "Pull request"}
                  {summary.prNumber ? (
                    <span className={styles.prNum}> #{summary.prNumber}</span>
                  ) : null}
                </h1>
              </div>
            </div>

            <p className={styles.comment}>{summary.overallAiComment || "—"}</p>

            <div className={styles.metaGrid}>
          <div>
            <span className={styles.metaK}>PR URL</span>
            <span className={styles.metaV}>
              {payload.prUrl ? (
                <a href={payload.prUrl} target="_blank" rel="noreferrer" className={styles.inlineLink}>
                  {payload.prUrl}
                </a>
              ) : (
                "—"
              )}
            </span>
          </div>
          <div>
            <span className={styles.metaK}>Base branch</span>
            <span className={styles.metaV}>{summary.baseBranch || "—"}</span>
          </div>
              <div>
                <span className={styles.metaK}>Branch</span>
                <span className={styles.metaV}>{summary.branch || "—"}</span>
              </div>
              <div>
                <span className={styles.metaK}>Author</span>
                <span className={styles.metaV}>{summary.author || "—"}</span>
              </div>
              <div>
                <span className={styles.metaK}>Analyzed at</span>
                <span className={styles.metaV}>{formatDate(payload.analyzedAt)}</span>
              </div>
              <div>
                <span className={styles.metaK}>Review date</span>
                <span className={styles.metaV}>{formatDate(summary.reviewDate)}</span>
              </div>
              <div>
                <span className={styles.metaK}>Duration</span>
                <span className={styles.metaV}>{formatDuration(summary.duration)}</span>
              </div>
              <div>
                <span className={styles.metaK}>Status</span>
                <span className={styles.metaV}>{summary.status}</span>
              </div>
              <div>
                <span className={styles.metaK}>Request</span>
                <span className={styles.metaV}>{summary.requestId || "—"}</span>
              </div>
            </div>

            <div className={styles.actions}>
              {summary.githubUrl ? (
                <a className={styles.btn} href={summary.githubUrl} target="_blank" rel="noreferrer">
                  Open on GitHub
                </a>
              ) : null}
              <Link className={styles.btnGhost} href="/high-risk">
                High risk findings
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      <section className={`${styles.toolbar} no-print`} aria-label="Export report">
        <button type="button" className={styles.toolBtn} onClick={exportFullJson}>
          Export JSON
        </button>
        <button type="button" className={styles.toolBtn} onClick={exportIssuesCsv}>
          Export issues CSV
        </button>
        <button type="button" className={styles.toolBtn} onClick={() => exportPrintableReport()}>
          Print / Save as PDF
        </button>
      </section>

      {(envelope && Object.keys(envelope).length) || summary.message ? (
        <section className={styles.banner} aria-label="API envelope">
          <div className={styles.bannerGrid}>
            {summary.success !== undefined ? (
              <div>
                <span className={styles.metaK}>success</span>
                <span className={styles.metaV}>{String(summary.success)}</span>
              </div>
            ) : null}
            {summary.message ? (
              <div>
                <span className={styles.metaK}>message</span>
                <span className={styles.metaV}>{summary.message}</span>
              </div>
            ) : null}
          </div>
          {envelope && typeof envelope === "object" ? (
            <DynamicRemainder
              data={envelope}
              excludeKeys={["data", "result", "review", "payload"]}
              title="Envelope fields"
            />
          ) : null}
        </section>
      ) : null}

      <section className={styles.stats} aria-label="Key metrics">
        <Stat label="Total files changed" value={summary.totalFilesChanged || files.length} delay={0.02} />
        <Stat label="Lines added" value={summary.linesAdded} delay={0.04} />
        <Stat label="Lines deleted" value={summary.linesDeleted} delay={0.06} />
        <Stat label="Total issues" value={summary.totalIssues || issues.length} delay={0.08} />
        <Stat label="High risk findings" value={summary.highRiskFindings} delay={0.1} />
        <Stat label="Medium findings" value={summary.mediumFindings} delay={0.12} />
        <Stat label="Low findings" value={summary.lowFindings} delay={0.14} />
        <Stat label="Suggestions" value={summary.suggestionsCount || suggestions.length} delay={0.16} />
        <Stat label="Code quality" value={summary.codeQuality || "—"} delay={0.18} />
        <Stat label="Maintainability" value={summary.maintainability || "—"} delay={0.2} />
        <Stat label="Security score" value={summary.securityScore || "—"} delay={0.22} />
        <Stat label="Performance score" value={summary.performanceScore || "—"} delay={0.24} />
        <Stat label="Documentation score" value={summary.documentationScore || "—"} delay={0.26} />
        <Stat label="Testing score" value={summary.testingScore || "—"} delay={0.28} />
        <Stat label="Complexity score" value={summary.complexityScore || "—"} delay={0.3} />
      </section>

      <section className={styles.charts} aria-label="Charts">
        <h2 className={styles.h2}>Analytics</h2>
        <DashboardCharts charts={charts} prScore={summary.prScore} riskValue={riskValue} />
      </section>

      <AiInsightsPanel ai={aiInsights} raw={raw} />

      <section className={styles.files} aria-label="Changed files">
        <h2 className={styles.h2}>Changed files</h2>
        <div className={styles.fileList}>
          {files.length ? (
            files.map((f, i) => <FileAccordion key={i} file={f} index={i} />)
          ) : (
            <p className={styles.muted}>No file-level payload returned.</p>
          )}
        </div>
      </section>

      <IssuesTable issues={issues} />

      <SuggestionsPanel suggestions={suggestions} />

      <section className={styles.footerNote}>
        <h2 className={styles.h2}>Complete API payload coverage</h2>
        <p className={styles.muted}>
          Remaining top-level fields are rendered below so nothing returned by the API is
          dropped on the floor.
        </p>
        <DynamicRemainder
          data={raw}
          excludeKeys={REVIEW_ROOT_EXCLUDE}
          title="Additional top-level response fields"
        />
      </section>
    </div>
  );
}
