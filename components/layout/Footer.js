"use client";

import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>
        <p className={styles.left}>
          © {new Date().getFullYear()} MergeWise. Built for engineering teams.
        </p>
        <div className={styles.right}>
          <Link href="/dashboard">Dashboard</Link>
          <span className={styles.dot} aria-hidden />
          <Link href="/history">History</Link>
          <span className={styles.dot} aria-hidden />
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className={styles.gh}
          >
            <FaGithub aria-hidden /> GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
