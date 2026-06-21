"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaTrash, FaSearch } from "react-icons/fa";
import { useHistory } from "../../hooks/useHistory";
import { STORAGE_KEYS } from "../../constants/storage";
import { formatDate } from "../../utils/format";
import styles from "./page.module.css";

export default function HistoryPage() {
  const router = useRouter();
  const { items, removeEntry, ready } = useHistory();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("date-desc");

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    let rows = items.filter((x) => {
      if (!ql) return true;
      return [x.prUrl, x.repository, x.title, x.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(ql);
    });
    rows = [...rows].sort((a, b) => {
      if (sort === "score-desc") return (b.prScore || 0) - (a.prScore || 0);
      if (sort === "score-asc") return (a.prScore || 0) - (b.prScore || 0);
      const da = new Date(a.storedAt).getTime();
      const db = new Date(b.storedAt).getTime();
      return sort === "date-asc" ? da - db : db - da;
    });
    return rows;
  }, [items, q, sort]);

  function openDashboard(id) {
    const snap = sessionStorage.getItem(`mergewise:snapshot:${id}`);
    if (!snap) {
      toast.error("Snapshot missing — please re-run analysis for this PR.");
      return;
    }
    sessionStorage.setItem(STORAGE_KEYS.lastReview, snap);
    router.push("/dashboard");
  }

  if (!ready) {
    return <div className={styles.wrap}>Loading history…</div>;
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>History</h1>
          <p className={styles.sub}>
            Locally stored analyses from this browser. Snapshots live in session storage
            until you clear site data.
          </p>
        </div>
      </header>

      <div className={styles.toolbar}>
        <label className={styles.search}>
          <FaSearch aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search repository, URL, title…"
            aria-label="Search history"
          />
        </label>
        <label className={styles.sort}>
          Sort
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort history">
            <option value="date-desc">Newest first</option>
            <option value="date-asc">Oldest first</option>
            <option value="score-desc">PR score high</option>
            <option value="score-asc">PR score low</option>
          </select>
        </label>
      </div>

      <div className={styles.list}>
        {filtered.length ? (
          filtered.map((x) => (
            <motion.article
              key={x.id}
              layout
              className={styles.card}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={styles.cardMain}>
                <p className={styles.repo}>{x.repository || "Repository"}</p>
                <p className={styles.titleRow}>{x.title || "Pull request"}</p>
                <p className={styles.url}>{x.prUrl}</p>
                <div className={styles.meta}>
                  <span>{formatDate(x.storedAt)}</span>
                  <span className={styles.sep}>·</span>
                  <span>PR score: {x.prScore ?? "—"}</span>
                  <span className={styles.sep}>·</span>
                  <span>Status: {x.status || "—"}</span>
                </div>
              </div>
              <div className={styles.cardActions}>
                <button type="button" className={styles.btn} onClick={() => openDashboard(x.id)}>
                  Open dashboard
                </button>
                <button
                  type="button"
                  className={styles.iconBtn}
                  aria-label={`Delete history ${x.prUrl}`}
                  onClick={() => {
                    sessionStorage.removeItem(`mergewise:snapshot:${x.id}`);
                    removeEntry(x.id);
                    toast.info("Removed from history");
                  }}
                >
                  <FaTrash />
                </button>
              </div>
            </motion.article>
          ))
        ) : (
          <p className={styles.empty}>No saved analyses match your filters.</p>
        )}
      </div>

      <p className={styles.hint}>
        Want a fresh review? <Link href="/">Start on the home page</Link>.
      </p>
    </div>
  );
}
