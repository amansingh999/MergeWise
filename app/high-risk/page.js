"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { STORAGE_KEYS } from "../../constants/storage";
import { buildReviewViewModel } from "../../utils/reviewViewModel";
import HighRiskBoard from "../../components/highrisk/HighRiskBoard";
import ui from "../../components/ui/ui.module.css";

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

  const findings = useMemo(() => {
    if (!payload?.apiResponse) return [];
    return buildReviewViewModel(payload.apiResponse).highRiskFindings;
  }, [payload]);

  if (!payload) {
    return (
      <div className={ui.page}>
        <div className={ui.empty}>
          <h1 className={ui.emptyTitle}>No review data</h1>
          <p className={ui.emptySub}>Run a PR review first to see risk findings.</p>
          <Link href="/" className={ui.btnPrimary} style={{ marginTop: "1.25rem", display: "inline-flex" }}>
            Review a PR
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={ui.page}>
      <header className={ui.pageHeader}>
        <h1 className={ui.pageTitle}>Risk findings</h1>
        <p className={ui.pageSub}>
          High and medium severity issues that need attention before merging.
        </p>
      </header>
      <HighRiskBoard findings={findings} />
    </div>
  );
}
