"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  fileAddedCode,
  fileDisplayName,
  fileLineArrays,
  fileRemovedCode,
} from "../../utils/fileChange";
import { pickStr } from "../../utils/pick";
import styles from "./FileDiffPanel.module.css";

const ReactDiffViewer = dynamic(() => import("react-diff-viewer").then((m) => m.default), {
  ssr: false,
  loading: () => <div className={styles.loading}>Loading diff viewer…</div>,
});

function guessLang(file) {
  return pickStr(file, ["language", "lang"], "javascript").toLowerCase();
}

function LineColumn({ title, lines, kind }) {
  if (!lines.length) {
    return (
      <div className={styles.lineCol}>
        <div className={styles.lineColHead}>{title}</div>
        <div className={styles.lineEmpty}>No lines</div>
      </div>
    );
  }
  return (
    <div className={styles.lineCol}>
      <div className={styles.lineColHead}>
        {title} <span className={styles.lineCount}>({lines.length})</span>
      </div>
      <pre className={styles.linePre}>
        {lines.map((line, i) => (
          <div
            key={i}
            className={kind === "added" ? styles.lineAdded : styles.lineRemoved}
          >
            <span className={styles.linePrefix}>{kind === "added" ? "+" : "-"}</span>
            <code>{line || " "}</code>
          </div>
        ))}
      </pre>
    </div>
  );
}

export default function FileDiffPanel({ file, fullscreen, onExitFullscreen }) {
  const { removedLines, addedLines } = useMemo(() => fileLineArrays(file), [file]);

  const oldCode = useMemo(() => fileRemovedCode(file), [file]);
  const newCode = useMemo(() => fileAddedCode(file), [file]);

  const hasLineArrays = removedLines.length > 0 || addedLines.length > 0;
  const [view, setView] = useState(hasLineArrays ? "lines" : "split");
  const [showSyntaxPreview, setShowSyntaxPreview] = useState(false);
  const lang = guessLang(file);
  const fileName = fileDisplayName(file);

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast.info("Copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  }

  function downloadPatch() {
    const patch =
      pickStr(file, ["patch", "diff", "unifiedDiff"], "") ||
      `--- a/${fileName}\n+++ b/${fileName}\n${removedLines.map((l) => `-${l}`).join("\n")}\n${addedLines.map((l) => `+${l}`).join("\n")}`;
    const blob = new Blob([patch], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName.replace(/[/\\]/g, "_")}.patch`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Patch downloaded");
  }

  return (
    <div className={fullscreen ? styles.fs : styles.wrap}>
      {fullscreen ? (
        <div className={styles.fsBar}>
          <button type="button" className={styles.btn} onClick={onExitFullscreen}>
            Exit fullscreen
          </button>
        </div>
      ) : null}

      <div className={styles.toolbar}>
        <div className={styles.viewTabs} role="tablist" aria-label="Diff view mode">
          <button
            type="button"
            role="tab"
            aria-selected={view === "lines"}
            className={view === "lines" ? styles.tabActive : styles.tab}
            onClick={() => setView("lines")}
          >
            Added / removed lines
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "split"}
            className={view === "split" ? styles.tabActive : styles.tab}
            onClick={() => setView("split")}
          >
            Side-by-side
          </button>
          {pickStr(file, ["patch"], "") ? (
            <button
              type="button"
              role="tab"
              aria-selected={view === "patch"}
              className={view === "patch" ? styles.tabActive : styles.tab}
              onClick={() => setView("patch")}
            >
              Raw patch
            </button>
          ) : null}
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.btn} onClick={() => copy(oldCode)}>
            Copy removed
          </button>
          <button type="button" className={styles.btn} onClick={() => copy(newCode)}>
            Copy added
          </button>
          <button type="button" className={styles.btn} onClick={downloadPatch}>
            Download patch
          </button>
          <button type="button" className={styles.btn} onClick={() => setShowSyntaxPreview((v) => !v)}>
            {showSyntaxPreview ? "Hide" : "Show"} syntax preview
          </button>
        </div>
      </div>

      {view === "lines" ? (
        <div className={styles.lineGrid}>
          <LineColumn title="Removed lines" lines={removedLines} kind="removed" />
          <LineColumn title="Added lines" lines={addedLines} kind="added" />
        </div>
      ) : null}

      {view === "split" ? (
        <div className={styles.diffShell}>
          <ReactDiffViewer
            oldValue={oldCode || "// (no removed code in API response)"}
            newValue={newCode || "// (no added code in API response)"}
            splitView
            useDarkTheme
            leftTitle="Removed / before"
            rightTitle="Added / after"
            showDiffOnly={false}
          />
        </div>
      ) : null}

      {view === "patch" ? (
        <pre className={styles.patchPre}>{pickStr(file, ["patch"], "")}</pre>
      ) : null}

      {showSyntaxPreview ? (
        <div className={styles.syntaxGrid}>
          <div>
            <div className={styles.syntaxTitle}>Syntax: removed ({lang})</div>
            <SyntaxHighlighter language={lang} style={oneDark} showLineNumbers>
              {oldCode || ""}
            </SyntaxHighlighter>
          </div>
          <div>
            <div className={styles.syntaxTitle}>Syntax: added ({lang})</div>
            <SyntaxHighlighter language={lang} style={oneDark} showLineNumbers>
              {newCode || ""}
            </SyntaxHighlighter>
          </div>
        </div>
      ) : null}
    </div>
  );
}
