"use client";

import { useCallback, useEffect, useState } from "react";
import { STORAGE_KEYS } from "../constants/storage";

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function useHistory() {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.history);
    setItems(Array.isArray(safeParse(raw)) ? safeParse(raw) : []);
    setReady(true);
  }, []);

  const addEntry = useCallback((entry) => {
    setItems((prev) => {
      const next = [
        entry,
        ...prev.filter((x) => x.id !== entry.id && x.prUrl !== entry.prUrl),
      ].slice(0, 50);
      try {
        localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const removeEntry = useCallback((id) => {
    setItems((prev) => {
      const next = prev.filter((x) => x.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    try {
      localStorage.setItem(STORAGE_KEYS.history, JSON.stringify([]));
    } catch {
      /* ignore */
    }
  }, []);

  return { items, addEntry, removeEntry, clear, ready };
}
