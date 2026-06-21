import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function formatDate(value) {
  if (value == null || value === "") return "—";
  const d = dayjs(value);
  if (!d.isValid()) return String(value);
  return d.format("MMM D, YYYY h:mm A");
}

export function formatRelative(value) {
  if (value == null || value === "") return "—";
  const d = dayjs(value);
  if (!d.isValid()) return String(value);
  return d.fromNow();
}

export function formatDuration(msOrSeconds) {
  if (msOrSeconds == null || msOrSeconds === "") return "—";
  let ms = Number(msOrSeconds);
  if (Number.isNaN(ms)) return String(msOrSeconds);
  if (ms < 1000 && ms > 200) ms = ms;
  else if (ms < 500) ms = ms * 1000;
  if (ms < 1000) return `${Math.round(ms)} ms`;
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rs = s % 60;
  return `${m}m ${rs}s`;
}

export function gradeFromScore(score) {
  const n = Number(score);
  if (Number.isNaN(n)) return "—";
  if (n >= 95) return "A+";
  if (n >= 90) return "A";
  if (n >= 85) return "A-";
  if (n >= 80) return "B+";
  if (n >= 75) return "B";
  if (n >= 70) return "B-";
  if (n >= 65) return "C+";
  if (n >= 60) return "C";
  if (n >= 55) return "C-";
  if (n >= 50) return "D";
  return "F";
}

export function safeString(v) {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}
