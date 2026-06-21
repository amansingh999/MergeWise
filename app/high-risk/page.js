"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { STORAGE_KEYS } from "../../constants/storage";
import { normalizeReviewResponse } from "../../utils/normalizeReview";
import HighRiskBoard from "../../components/highrisk/HighRiskBoard";
import styles from "./page.module.css";

export default function HighRiskPage() {
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEYS.lastReview);
      setPayload(raw ? JSON.parse(raw) : null);
    } catch {
      setPayload(null);
    }
  }, []);

  const highRisk = useMemo(() => {
    if (!payload?.apiResponse) return null;
    return normalizeReviewResponse(payload.apiResponse).highRisk;
  }, [payload]);

  if (!payload) {
    return (
      <div className={styles.wrap}>
        <h1 className={styles.title}>High risk findings</h1>
        <p className={styles.sub}>Run an analysis first, then return here.</p>
        <Link className={styles.cta} href="/">
          Analyze a PR
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>High risk findings</h1>
          <p className={styles.sub}>
            Dedicated view for security risks, critical defects, and stability hazards
            returned by the analyzer.
          </p>
        </div>
        <Link className={styles.ctaGhost} href="/dashboard">
          Back to dashboard
        </Link>
      </header>
      <HighRiskBoard highRisk={highRisk} />
    </div>
  );
}
