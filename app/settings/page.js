"use client";

import { useSettings } from "../../hooks/useSettings";
import ui from "../../components/ui/ui.module.css";
import styles from "./page.module.css";

export default function SettingsPage() {
  const { settings, setSettings, ready } = useSettings();

  if (!ready) {
    return <div className={ui.page}><p className={ui.muted}>Loading…</p></div>;
  }

  return (
    <div className={`${ui.page} ${ui.pageNarrow}`}>
      <header className={ui.pageHeader}>
        <h1 className={ui.pageTitle}>Settings</h1>
        <p className={ui.pageSub}>Preferences are saved locally in your browser.</p>
      </header>

      <section className={`${ui.card} ${styles.section}`}>
        <h2 className={styles.label}>Appearance</h2>
        <label className={styles.row}>
          <span>Theme</span>
          <select
            className={styles.select}
            value={settings.theme}
            onChange={(e) => setSettings({ theme: e.target.value })}
            aria-label="Theme"
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={settings.highContrast}
            onChange={(e) => setSettings({ highContrast: e.target.checked })}
          />
          <span>High contrast</span>
        </label>
      </section>

      <section className={`${ui.card} ${styles.section}`}>
        <h2 className={styles.label}>Motion</h2>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={settings.animations}
            onChange={(e) => setSettings({ animations: e.target.checked })}
          />
          <span>Enable animations</span>
        </label>
      </section>

      <section className={`${ui.card} ${styles.section}`}>
        <h2 className={styles.label}>Export</h2>
        <label className={styles.row}>
          <span>Default format</span>
          <select
            className={styles.select}
            value={settings.exportDefault}
            onChange={(e) => setSettings({ exportDefault: e.target.value })}
            aria-label="Export format"
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
            <option value="pdf">PDF (print)</option>
          </select>
        </label>
      </section>
    </div>
  );
}
