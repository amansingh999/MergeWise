"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaBolt, FaCodeBranch, FaShieldAlt } from "react-icons/fa";
import { analyzePullRequest, getAxiosErrorMessage } from "../../services/prApi";
import { normalizeReviewResponse } from "../../utils/normalizeReview";
import { STORAGE_KEYS } from "../../constants/storage";
import { useHistory } from "../../hooks/useHistory";
import { useSettings } from "../../hooks/useSettings";
import AnalyzeLoader from "../loading/AnalyzeLoader";
import Footer from "../layout/Footer";
import ui from "../ui/ui.module.css";
import styles from "./LandingPage.module.css";

const features = [
  {
    title: "Instant PR insights",
    desc: "Get a clear score, risk level, and review decision in seconds.",
    icon: FaBolt,
  },
  {
    title: "Security & quality",
    desc: "Surface null checks, logging issues, and code quality problems.",
    icon: FaShieldAlt,
  },
  {
    title: "Actionable fixes",
    desc: "Every finding includes context, suggestions, and relevant code snippets.",
    icon: FaCodeBranch,
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { addEntry } = useHistory();
  const { settings } = useSettings();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

  const canSubmit = useMemo(() => url.trim().length > 8, [url]);
  const heroMotion = settings.animations
    ? { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }
    : {};

  async function onAnalyze(e) {
    e.preventDefault();
    if (!canSubmit || busy) return;
    setBusy(true);
    setProgress(12);
    const tick = window.setInterval(() => {
      setProgress((p) => (p >= 92 ? p : p + 3));
    }, 450);
    try {
      const data = await analyzePullRequest(url.trim());
      setProgress(100);
      const normalized = normalizeReviewResponse(data);
      const id = `${Date.now()}`;
      const payload = {
        apiResponse: data,
        normalized,
        prUrl: url.trim(),
        analyzedAt: new Date().toISOString(),
      };
      sessionStorage.setItem(`mergewise:snapshot:${id}`, JSON.stringify(payload));
      sessionStorage.setItem(STORAGE_KEYS.lastReview, JSON.stringify(payload));
      sessionStorage.setItem(STORAGE_KEYS.lastPrUrl, url.trim());

      addEntry({
        id,
        prUrl: url.trim(),
        storedAt: payload.analyzedAt,
        repository: normalized.summary.repository,
        prScore: normalized.summary.prScore,
        status: normalized.summary.finalDecision || normalized.summary.status,
        title: normalized.summary.prTitle,
      });

      toast.success("Review complete");
      router.push("/dashboard");
    } catch (err) {
      toast.error(getAxiosErrorMessage(err));
    } finally {
      window.clearInterval(tick);
      setBusy(false);
      setProgress(0);
    }
  }

  return (
    <div className={styles.page}>
      {busy ? <AnalyzeLoader progress={progress} /> : null}

      <section className={styles.hero} aria-labelledby="hero-title">
        <motion.div className={styles.heroInner} {...heroMotion} transition={{ duration: 0.4 }}>
          <p className={styles.kicker}>AI pull request review</p>
          <h1 id="hero-title" className={styles.h1}>
            Understand your PR in seconds
          </h1>
          <p className={styles.lead}>
            Paste a GitHub pull request URL. MergeWise analyzes changes, flags risks,
            and surfaces only what you need to act on.
          </p>

          <form className={styles.form} onSubmit={onAnalyze} aria-label="Review pull request">
            <div className={styles.inputRow}>
              <input
                id="pr-url"
                name="prUrl"
                type="url"
                inputMode="url"
                autoComplete="url"
                placeholder="https://github.com/org/repo/pull/123"
                className={ui.input}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                aria-label="GitHub pull request URL"
              />
              <button
                type="submit"
                className={`${ui.btnPrimary} ${styles.submit}`}
                disabled={!canSubmit || busy}
              >
                Review PR
              </button>
            </div>
          </form>
        </motion.div>

        <motion.div
          className={styles.preview}
          {...(settings.animations ? { initial: { opacity: 0 }, animate: { opacity: 1 } } : {})}
          transition={{ delay: 0.15, duration: 0.5 }}
          aria-hidden
        >
          <div className={styles.previewCard}>
            <div className={styles.previewScore}>95</div>
            <div className={styles.previewMeta}>
              <span className={styles.previewBadge}>Critical risk</span>
              <span className={styles.previewBadge}>Changes required</span>
            </div>
          </div>
          <div className={styles.previewMetrics}>
            <span>1 file</span>
            <span>14 issues</span>
            <span>14 suggestions</span>
          </div>
        </motion.div>
      </section>

      <section className={styles.features} aria-labelledby="features-title">
        <h2 id="features-title" className={styles.featuresTitle}>
          Built for focused code review
        </h2>
        <div className={styles.featureGrid}>
          {features.map((f) => (
            <article key={f.title} className={styles.feature}>
              <f.icon className={styles.featureIcon} aria-hidden />
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
