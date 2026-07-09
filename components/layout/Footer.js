import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>
        <p>© {new Date().getFullYear()} MergeWise</p>
        <div className={styles.links}>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/history">History</Link>
        </div>
      </div>
    </footer>
  );
}
