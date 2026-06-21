"use client";

import { useSettings } from "../../hooks/useSettings";
import styles from "./page.module.css";

export default function SettingsPage() {
  const { settings, setSettings, ready } = useSettings();

  if (!ready) return <div className={styles.wrap}>Loading settings…</div>;

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Settings</h1>
      <p className={styles.sub}>
        Preferences are stored locally in your browser — no account required.
      </p>

      <section className={styles.card} aria-labelledby="theme-heading">
        <h2 id="theme-heading" className={styles.h2}>
          Theme
        </h2>
        <p className={styles.p}>MergeWise ships with a curated dark premium theme.</p>
        <label className={styles.row}>
          <span>Variant</span>
          <select
            value={settings.theme}
            onChange={(e) => setSettings({ theme: e.target.value })}
            aria-label="Theme variant"
          >
            <option value="dark">Dark premium</option>
          </select>
        </label>
      </section>

      <section className={styles.card} aria-labelledby="motion-heading">
        <h2 id="motion-heading" className={styles.h2}>
          Motion
        </h2>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={settings.animations}
            onChange={(e) => setSettings({ animations: e.target.checked })}
            aria-describedby="motion-hint"
          />
          <span>Enable UI animations</span>
        </label>
        <p id="motion-hint" className={styles.hint}>
          Disable for reduced motion preference or low-power devices.
        </p>
      </section>

      <section className={styles.card} aria-labelledby="charts-heading">
        <h2 id="charts-heading" className={styles.h2}>
          Chart preferences
        </h2>
        <label className={styles.row}>
          <span>Density</span>
          <select
            value={settings.chartDensity}
            onChange={(e) => setSettings({ chartDensity: e.target.value })}
            aria-label="Chart density"
          >
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </select>
        </label>
      </section>

      <section className={styles.card} aria-labelledby="export-heading">
        <h2 id="export-heading" className={styles.h2}>
          Export preference
        </h2>
        <label className={styles.row}>
          <span>Default export</span>
          <select
            value={settings.exportDefault}
            onChange={(e) => setSettings({ exportDefault: e.target.value })}
            aria-label="Default export format"
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
            <option value="pdf">PDF (via print)</option>
          </select>
        </label>
      </section>

      <section className={styles.card} aria-labelledby="a11y-heading">
        <h2 id="a11y-heading" className={styles.h2}>
          Accessibility
        </h2>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={settings.highContrast}
            onChange={(e) => setSettings({ highContrast: e.target.checked })}
            aria-describedby="hc-hint"
          />
          <span>High contrast</span>
        </label>
        <p id="hc-hint" className={styles.hint}>
          Increases border contrast across the UI.
        </p>
      </section>
    </div>
  );
}
