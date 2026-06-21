import { safeString } from "./format";

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.click();
  URL.revokeObjectURL(url);
}

export function exportJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  downloadBlob(filename.endsWith(".json") ? filename : `${filename}.json`, blob);
}

export function exportCsv(filename, rows) {
  if (!rows.length) {
    const blob = new Blob([""], { type: "text/csv;charset=utf-8" });
    downloadBlob(filename, blob);
    return;
  }
  const headers = Object.keys(rows[0]);
  const esc = (cell) => {
    const s = safeString(cell);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => esc(r[h])).join(",")),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  downloadBlob(filename.endsWith(".csv") ? filename : `${filename}.csv`, blob);
}

export function exportPrintableReport() {
  window.print();
}
