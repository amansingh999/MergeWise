"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaGithub } from "react-icons/fa";
import { motion } from "framer-motion";
import { BRAND } from "../../constants/theme";
import styles from "./Navbar.module.css";

const links = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/high-risk", label: "High Risk" },
  { href: "/history", label: "History" },
  { href: "/settings", label: "Settings" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className={styles.header} role="banner">
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label={`${BRAND.name} home`}>
          <span className={styles.logoMark} aria-hidden />
          <span>
            <span className={styles.brandName}>{BRAND.name}</span>
            <span className={styles.brandTag}>{BRAND.tagline}</span>
          </span>
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          {links.map((l) => {
            const active =
              l.href === "/"
                ? pathname === "/"
                : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={active ? styles.navLinkActive : styles.navLink}
                aria-current={active ? "page" : undefined}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.actions}>
          <motion.a
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className={styles.gh}
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
          >
            <FaGithub size={20} />
            <span>GitHub</span>
          </motion.a>
        </div>
      </div>
    </header>
  );
}
