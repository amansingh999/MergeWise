import { pick, pickStr } from "./pick";

/** Prefer numeric counts from API; fall back to array lengths. */
export function pickLineCount(file, numKeys, arrKeys) {
  if (!file || typeof file !== "object") return 0;
  for (const key of numKeys) {
    const v = file[key];
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  for (const key of arrKeys) {
    const v = file[key];
    if (Array.isArray(v)) return v.length;
  }
  return 0;
}

export function fileDisplayName(file) {
  return pickStr(file, ["filename", "fileName", "path", "filePath", "name"], "file");
}

export function fileLineArrays(file) {
  const removed = pick(file, ["removedLines", "deletedLines"]);
  const added = pick(file, ["addedLines"]);
  return {
    removedLines: Array.isArray(removed) ? removed : [],
    addedLines: Array.isArray(added) ? added : [],
  };
}

export function fileRemovedCode(file) {
  const { removedLines } = fileLineArrays(file);
  if (removedLines.length) return removedLines.join("\n");
  return pickStr(
    file,
    ["oldCode", "beforeCode", "before", "old", "previous", "left"],
    "",
  );
}

export function fileAddedCode(file) {
  const { addedLines } = fileLineArrays(file);
  if (addedLines.length) return addedLines.join("\n");
  return pickStr(file, ["newCode", "afterCode", "after", "new", "current", "right"], "");
}

export function aggregateFileStats(files) {
  let additions = 0;
  let deletions = 0;
  for (const f of files) {
    additions += pickLineCount(f, ["additions", "linesAdded"], ["addedLines"]);
    deletions += pickLineCount(f, ["deletions", "linesDeleted"], ["removedLines", "deletedLines"]);
  }
  return { additions, deletions };
}
