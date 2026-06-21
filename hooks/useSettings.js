"use client";

import { useCallback, useEffect, useState } from "react";
import { STORAGE_KEYS } from "../constants/storage";

const defaultSettings = {
  theme: "dark",
  animations: true,
  chartDensity: "comfortable",
  exportDefault: "json",
  highContrast: false,
};

export function useSettings() {
  const [settings, setSettingsState] = useState(defaultSettings);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.settings);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSettingsState({ ...defaultSettings, ...parsed });
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const setSettings = useCallback((patch) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return { settings, setSettings, ready };
}
