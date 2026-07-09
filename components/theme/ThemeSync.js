"use client";

import { useEffect } from "react";
import { useSettings } from "../../hooks/useSettings";

export default function ThemeSync() {
  const { settings, ready } = useSettings();

  useEffect(() => {
    if (!ready) return;

    const root = document.documentElement;
    root.classList.toggle("high-contrast", Boolean(settings.highContrast));

    const apply = (theme) => {
      root.setAttribute("data-theme", theme);
    };

    if (settings.theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      apply(mq.matches ? "dark" : "light");
      const handler = (e) => apply(e.matches ? "dark" : "light");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }

    apply(settings.theme === "light" ? "light" : "dark");
  }, [settings.theme, settings.highContrast, ready]);

  return null;
}
