"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { pickStr } from "../../utils/pick";
import styles from "./FileDiffPanel.module.css";

const ReactDiffViewer = dynamic(() => import("react-diff-viewer").then((m) => m.default), {
  ssr: false,
  loading: () => <div className={styles.loading}>Loading diff viewer…</div>,
});

function guessLang(file) {
  return pickStr(file, ["language", "lang"], "javascript").toLowerCase();
}

export default function FileDiffPanel({ file, fullscreen, onExitFullscreen }) {
  const oldCode = useMemo(() => {
    return pickStr(
      file,
      ["oldCode", "beforeCode", "before", "old", "previous", "left"],
      "",
    );
  }, [file]);

  const newCode = useMemo(() => {
    return pickStr(file, ["newCode", "afterCode", "after", "new", "current", "right"], "");
  }, [file]);

  const [showSyntaxPreview, setShowSyntaxPreview] = useState(false);
  const lang = guessLang(file);

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
      `--- a/file\n+++ b/file\n${oldCode ? `- ${oldCode.split("\n").join("\n- ")}\n` : ""}${newCode ? `+ ${newCode.split("\n").join("\n+ ")}` : ""}`;
    const blob = new Blob([patch], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pickStr(file, ["fileName", "path"], "change")}.patch`;
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
        <div className={styles.steps} aria-hidden>
          <span>Old code</span>
          <span className={styles.arrow}>↓</span>
          <span>Highlighted changes</span>
          <span className={styles.arrow}>↓</span>
          <span>New code</span>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.btn} onClick={() => copy(oldCode)}>
            Copy old
          </button>
          <button type="button" className={styles.btn} onClick={() => copy(newCode)}>
            Copy new
          </button>
          <button type="button" className={styles.btn} onClick={downloadPatch}>
            Download patch
          </button>
          <button type="button" className={styles.btn} onClick={() => setShowSyntaxPreview((v) => !v)}>
            {showSyntaxPreview ? "Hide" : "Show"} syntax preview
          </button>
        </div>
      </div>

      <div className={styles.diffShell}>
        <ReactDiffViewer
          oldValue={oldCode || "// (no old code in API response)"}
          newValue={newCode || "// (no new code in API response)"}
          splitView
          useDarkTheme
          leftTitle="Old"
          rightTitle="New"
          showDiffOnly={false}
        />
      </div>

      {showSyntaxPreview ? (
        <div className={styles.syntaxGrid}>
          <div>
            <div className={styles.syntaxTitle}>Syntax: old ({lang})</div>
            <SyntaxHighlighter language={lang} style={oneDark} showLineNumbers>
              {oldCode || ""}
            </SyntaxHighlighter>
          </div>
          <div>
            <div className={styles.syntaxTitle}>Syntax: new ({lang})</div>
            <SyntaxHighlighter language={lang} style={oneDark} showLineNumbers>
              {newCode || ""}
            </SyntaxHighlighter>
          </div>
        </div>
      ) : null}
    </div>
  );
}
