"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaGithub, FaMoon, FaSun } from "react-icons/fa";
import { useSettings } from "../../hooks/useSettings";
import styles from "./Navbar.module.css";

const links = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/history", label: "History" },
  { href: "/settings", label: "Settings" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { settings, setSettings } = useSettings();

  function toggleTheme() {
    const next =
      settings.theme === "dark"
        ? "light"
        : settings.theme === "light"
          ? "system"
          : "dark";
    setSettings({ theme: next });
  }

  const themeIcon =
    settings.theme === "light" ? (
      <FaSun size={15} />
    ) : (
      <FaMoon size={15} />
    );

  return (
    <header className={styles.header} role="banner">
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="MergeWise home">
          <span className={styles.logo} aria-hidden />
          <span className={styles.brandName}>MergeWise</span>
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          {links.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={active ? styles.linkActive : styles.link}
                aria-current={active ? "page" : undefined}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={`Theme: ${settings.theme}`}
          >
            {themeIcon}
          </button>
          <a
            className={styles.ghBtn}
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
          >
            <FaGithub size={16} />
          </a>
        </div>
      </div>
    </header>
  );
}
