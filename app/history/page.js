"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FaSearch, FaTrash } from "react-icons/fa";
import { useHistory } from "../../hooks/useHistory";
import { STORAGE_KEYS } from "../../constants/storage";
import { formatDate } from "../../utils/format";
import ui from "../../components/ui/ui.module.css";
import styles from "./page.module.css";

export default function HistoryPage() {
  const router = useRouter();
  const { items, removeEntry, ready } = useHistory();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return [...items]
      .filter((x) => {
        if (!ql) return true;
        return [x.prUrl, x.repository, x.title].filter(Boolean).join(" ").toLowerCase().includes(ql);
      })
      .sort((a, b) => new Date(b.storedAt) - new Date(a.storedAt));
  }, [items, q]);

  function openDashboard(id) {
    const snap = sessionStorage.getItem(`mergewise:snapshot:${id}`);
    if (!snap) {
      toast.error("Snapshot missing — re-run the review.");
      return;
    }
    sessionStorage.setItem(STORAGE_KEYS.lastReview, snap);
    router.push("/dashboard");
  }

  if (!ready) {
    return <div className={ui.page}><p className={ui.muted}>Loading…</p></div>;
  }

  return (
    <div className={ui.page}>
      <header className={ui.pageHeader}>
        <h1 className={ui.pageTitle}>History</h1>
        <p className={ui.pageSub}>Past reviews stored in this browser.</p>
      </header>

      <label className={styles.search}>
        <FaSearch aria-hidden />
        <input
          className={styles.searchInput}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search reviews…"
          aria-label="Search history"
        />
      </label>

      <div className={styles.list}>
        {filtered.length ? (
          filtered.map((x) => (
            <article key={x.id} className={`${ui.card} ${styles.card}`}>
              <div className={styles.cardMain}>
                <p className={styles.repo}>{x.repository || "Repository"}</p>
                <p className={styles.cardTitle}>{x.title || `PR review`}</p>
                <p className={styles.meta}>
                  Score {x.prScore ?? "—"} · {formatDate(x.storedAt)}
                </p>
              </div>
              <div className={styles.actions}>
                <button type="button" className={ui.btn} onClick={() => openDashboard(x.id)}>
                  Open
                </button>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  aria-label="Delete"
                  onClick={() => {
                    sessionStorage.removeItem(`mergewise:snapshot:${x.id}`);
                    removeEntry(x.id);
                    toast.info("Removed");
                  }}
                >
                  <FaTrash size={13} />
                </button>
              </div>
            </article>
          ))
        ) : (
          <p className={ui.muted}>No reviews yet. <Link href="/">Analyze a PR</Link></p>
        )}
      </div>
    </div>
  );
}
