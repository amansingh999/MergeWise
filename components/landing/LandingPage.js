"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  FaBolt,
  FaChartPie,
  FaCodeBranch,
  FaShieldAlt,
  FaStream,
  FaTasks,
} from "react-icons/fa";
import { analyzePullRequest, getAxiosErrorMessage } from "../../services/prApi";
import { normalizeReviewResponse } from "../../utils/normalizeReview";
import { STORAGE_KEYS } from "../../constants/storage";
import { useHistory } from "../../hooks/useHistory";
import AnalyzeLoader from "../loading/AnalyzeLoader";
import Footer from "../layout/Footer";
import styles from "./LandingPage.module.css";

const features = [
  {
    title: "PR Score",
    desc: "Holistic quality signal distilled into a single actionable score.",
    icon: FaChartPie,
  },
  {
    title: "Risk Detection",
    desc: "Surface regressions and risky change patterns before they ship.",
    icon: FaBolt,
  },
  {
    title: "Security Analysis",
    desc: "Catch injection, auth, and secret-handling issues early.",
    icon: FaShieldAlt,
  },
  {
    title: "Code Quality",
    desc: "Smells, complexity hotspots, and clarity problems in one pass.",
    icon: FaStream,
  },
  {
    title: "Performance Review",
    desc: "Spot blocking work, N+1 patterns, and wasteful hot paths.",
    icon: FaTasks,
  },
  {
    title: "Maintainability",
    desc: "Understand long-term ownership cost across the diff.",
    icon: FaCodeBranch,
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { addEntry } = useHistory();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

  const canSubmit = useMemo(() => url.trim().length > 8, [url]);

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
        status: normalized.summary.status,
        title: normalized.summary.prTitle,
      });

      toast.success("Review complete — opening dashboard");
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
        <div className={styles.heroGrid}>
          <div>
            <motion.p
              className={styles.kicker}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              AI Powered Pull Request Review
            </motion.p>
            <motion.h1 id="hero-title" className={styles.h1}>
              MergeWise
            </motion.h1>
            <motion.p className={styles.lead} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}>
              Analyze GitHub Pull Requests in seconds. Discover bugs, code smells,
              security risks, maintainability issues and receive intelligent
              suggestions with AI.
            </motion.p>

            <form className={styles.form} onSubmit={onAnalyze} aria-label="Analyze pull request">
              <label className={styles.label} htmlFor="pr-url">
                Paste GitHub PR URL
              </label>
              <div className={styles.inputRow}>
                <input
                  id="pr-url"
                  name="prUrl"
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  placeholder="https://github.com/org/repo/pull/123"
                  className={styles.input}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  aria-describedby="pr-url-hint"
                />
                <motion.button
                  type="submit"
                  className={styles.cta}
                  disabled={!canSubmit || busy}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Analyze
                </motion.button>
              </div>
              <p id="pr-url-hint" className={styles.hint}>
                We call the live MergeWise analyzer — no mock data.
              </p>
            </form>
          </div>

          <motion.div
            className={styles.art}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55 }}
            aria-hidden
          >
            <div className={styles.glow} />
            <div className={styles.mockUi}>
              <div className={styles.mockTop}>
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </div>
              <div className={styles.mockBody}>
                <div className={styles.spark} />
                <div className={styles.bars}>
                  <span style={{ height: "42%" }} />
                  <span style={{ height: "68%" }} />
                  <span style={{ height: "55%" }} />
                  <span style={{ height: "80%" }} />
                  <span style={{ height: "36%" }} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="features-title">
        <div className={styles.sectionHead}>
          <h2 id="features-title" className={styles.h2}>
            Feature depth that matches your review bar
          </h2>
          <p className={styles.sectionSub}>
            Every surface is tuned for fast scanning, deep dives, and crisp
            storytelling for stakeholders.
          </p>
        </div>
        <div className={styles.cards}>
          {features.map((f, i) => (
            <motion.article
              key={f.title}
              className={styles.card}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              whileHover={{ y: -4 }}
            >
              <f.icon className={styles.cardIcon} aria-hidden />
              <h3 className={styles.cardTitle}>{f.title}</h3>
              <p className={styles.cardDesc}>{f.desc}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="charts-title">
        <div className={styles.sectionHead}>
          <h2 id="charts-title" className={styles.h2}>
            Interactive analytics
          </h2>
          <p className={styles.sectionSub}>
            After analysis, dashboards light up with Recharts: pies, bars, areas,
            radar, gauges, heat maps, and stacked diffs — tuned for motion and
            clarity.
          </p>
        </div>
        <div className={styles.chartStage} aria-label="Decorative chart preview">
          <div className={styles.chartGlow} />
          <div className={styles.chartGrid}>
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className={styles.heatCell} style={{ opacity: 0.15 + (i % 5) * 0.12 }} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
