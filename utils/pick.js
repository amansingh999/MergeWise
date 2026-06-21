/** First defined value among candidates (paths or keys on obj). */
export function pick(obj, paths) {
  if (!obj || typeof obj !== "object") return undefined;
  for (const p of paths) {
    if (typeof p === "string" && p.includes(".")) {
      const parts = p.split(".");
      let cur = obj;
      for (const part of parts) {
        if (cur == null) break;
        cur = cur[part];
      }
      if (cur !== undefined && cur !== null && cur !== "") return cur;
    } else if (obj[p] !== undefined && obj[p] !== null && obj[p] !== "") {
      return obj[p];
    }
  }
  return undefined;
}

export function pickNum(obj, paths, fallback = 0) {
  const v = pick(obj, paths);
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function pickStr(obj, paths, fallback = "") {
  const v = pick(obj, paths);
  if (v == null) return fallback;
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (typeof v === "object") {
    try {
      return JSON.stringify(v);
    } catch {
      return fallback;
    }
  }
  return String(v);
}

export function pickBool(obj, paths) {
  const v = pick(obj, paths);
  if (typeof v === "boolean") return v;
  if (v === "true") return true;
  if (v === "false") return false;
  return undefined;
}

export function asArray(v) {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}
