"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaFileCode,
  FaLightbulb,
  FaShieldAlt,
  FaTimesCircle,
} from "react-icons/fa";
import { STORAGE_KEYS } from "../../constants/storage";
import { buildReviewViewModel } from "../../utils/reviewViewModel";
import { exportCsv, exportJson } from "../../utils/exportReport";
import FileAccordion from "../files/FileAccordion";
import ui from "../ui/ui.module.css";
import styles from "./DashboardView.module.css";

function Metric({ icon: Icon, label, value, tone }) {
  return (
    <div className={`${ui.metric} ${tone ? ui[`metric_${tone}`] : ""}`}>
      <Icon className={ui.metricIcon} aria-hidden />
      <div>
        <span className={ui.metricValue}>{value ?? "—"}</span>
        <span className={ui.metricLabel}>{label}</span>
      </div>
    </div>
  );
}

export default function DashboardView() {
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEYS.lastReview);
      setPayload(raw ? JSON.parse(raw) : null);
    } catch {
      setPayload(null);
    }
  }, []);

  const vm = useMemo(() => {
    if (!payload?.apiResponse) return null;
    return buildReviewViewModel(payload.apiResponse);
  }, [payload]);

  if (!payload || !vm) {
    return (
      <div className={ui.page}>
        <div className={ui.empty}>
          <h1 className={ui.emptyTitle}>No review yet</h1>
          <p className={ui.emptySub}>
            Analyze a pull request to see your review summary here.
          </p>
          <Link href="/" className={`${ui.btnPrimary}`} style={{ marginTop: "1.25rem", display: "inline-flex" }}>
            Review a PR
          </Link>
        </div>
      </div>
    );
  }

  const { header, metrics, files, topIssues } = vm;

  function exportJsonReport() {
    exportJson(`mergewise-report-${Date.now()}.json`, vm.exportPayload);
    toast.success("Report exported");
  }

  function exportIssuesCsv() {
    const rows = files.flatMap((f) =>
      f.issues.map((i) => ({
        file: f.name,
        severity: i.severity,
        title: i.title,
        suggestion: i.suggestion,
      })),
    );
    exportCsv(`mergewise-issues-${Date.now()}.csv`, rows);
    toast.success("Issues exported");
  }

  return (
    <div className={`${ui.page} print-area`}>
      <header className={styles.hero}>
        <div className={styles.heroMain}>
          <div className={styles.scoreRing}>
            <span className={styles.scoreNum}>{metrics.prScore}</span>
          </div>
          <div className={styles.heroText}>
            <p className={styles.repo}>{header.repository}</p>
            <h1 className={styles.title}>
              PR #{header.prNumber}
            </h1>
            <div className={styles.badges}>
              {header.riskLevel ? (
                <span className={ui.badgeDanger}>{header.riskLevel} risk</span>
              ) : null}
              {header.finalDecision ? (
                <span className={ui.badgeWarning}>
                  {header.finalDecision.replace(/_/g, " ")}
                </span>
              ) : null}
              <span className={ui.badge}>{metrics.reviewStatus}</span>
            </div>
          </div>
        </div>
        <div className={styles.actions}>
          <button type="button" className={ui.btnGhost} onClick={exportIssuesCsv}>
            Export CSV
          </button>
          <button type="button" className={ui.btnGhost} onClick={exportJsonReport}>
            Export JSON
          </button>
        </div>
      </header>

      <div className={ui.metricGrid}>
        <Metric icon={FaFileCode} label="Files changed" value={metrics.totalFiles} />
        <Metric icon={FaExclamationTriangle} label="Total issues" value={metrics.totalIssues} tone="warning" />
        <Metric icon={FaTimesCircle} label="High risk" value={metrics.highRisk} tone="danger" />
        <Metric icon={FaShieldAlt} label="Medium risk" value={metrics.mediumRisk} />
        <Metric icon={FaCheckCircle} label="Low risk" value={metrics.lowRisk} tone="success" />
        <Metric icon={FaLightbulb} label="Suggestions" value={metrics.suggestions} />
      </div>

      <section className={ui.section}>
        <div className={ui.sectionHead}>
          <h2 className={ui.sectionTitle}>File changes</h2>
          <span className={ui.sectionCount}>{files.length} files</span>
        </div>
        <div className={styles.fileList}>
          {files.map((f, i) => (
            <FileAccordion key={f.name} file={f} index={i} />
          ))}
        </div>
      </section>

      {topIssues.length ? (
        <section className={ui.section}>
          <div className={ui.sectionHead}>
            <h2 className={ui.sectionTitle}>Priority findings</h2>
          </div>
          <ul className={styles.findings}>
            {topIssues.map((issue) => (
              <li key={issue.id} className={styles.finding}>
                <span className={`${styles.sev} ${styles[`sev_${issue.severity.toLowerCase()}`]}`}>
                  {issue.severity}
                </span>
                <div>
                  <p className={styles.findingTitle}>{issue.title}</p>
                  {issue.explanation ? (
                    <p className={styles.findingDesc}>{issue.explanation}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
