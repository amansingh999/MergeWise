import { normalizeReviewResponse } from "./normalizeReview";
import { fileDisplayName, fileLineArrays, pickLineCount } from "./fileChange";
import { pickNum, pickStr } from "./pick";

const CONTEXT_LINES = 5;
const MAX_SNIPPET_LINES = 8;

function severityRank(sev) {
  const s = String(sev).toLowerCase();
  if (s.includes("crit")) return 0;
  if (s.includes("high")) return 1;
  if (s.includes("med")) return 2;
  if (s.includes("low")) return 3;
  return 4;
}

function normalizeSeverity(sev) {
  const s = String(sev).toUpperCase();
  if (s.includes("CRIT")) return "CRITICAL";
  if (s.includes("HIGH")) return "HIGH";
  if (s.includes("MED")) return "MEDIUM";
  if (s.includes("LOW")) return "LOW";
  return s || "INFO";
}

function dedupeIssues(issues) {
  const map = new Map();
  for (const issue of issues) {
    const key = pickStr(issue, ["title"], pickStr(issue, ["description"], ""));
    const existing = map.get(key);
    if (!existing || severityRank(issue.severity) < severityRank(existing.severity)) {
      map.set(key, issue);
    }
  }
  return [...map.values()].sort(
    (a, b) => severityRank(a.severity) - severityRank(b.severity),
  );
}

function issuesForFile(allIssues, filename) {
  return allIssues.filter((i) => {
    const f = pickStr(i, ["file", "path", "filePath", "filename"], "");
    if (!f || f === "AI provider") return false;
    return f === filename || filename.endsWith(f) || f.endsWith(filename);
  });
}

function extractCodeHint(title) {
  const match = title.match(/:\s*(.+?)\.?$/);
  if (match) return match[1].trim();
  const backtick = title.match(/`([^`]+)`/);
  if (backtick) return backtick[1];
  return "";
}

function findImportantLineIndices(addedLines, removedLines, fileIssues) {
  const indices = new Set();

  addedLines.forEach((line, i) => {
    if (/❌|FIXME|TODO|HACK|XXX/i.test(line)) indices.add(i);
  });

  for (const issue of fileIssues) {
    const hint = extractCodeHint(pickStr(issue, ["title"], ""));
    if (!hint) continue;
    const idx = addedLines.findIndex(
      (l) => l.includes(hint) || hint.includes(l.trim()),
    );
    if (idx >= 0) indices.add(idx);
  }

  removedLines.forEach((line, i) => {
    if (/❌|FIXME|TODO/i.test(line)) indices.add(i);
  });

  return [...indices].sort((a, b) => a - b);
}

function buildSnippetWindows(indices, addedLines, removedLines) {
  if (!indices.length) return [];

  const windows = [];
  let start = Math.max(0, indices[0] - CONTEXT_LINES);
  let end = Math.min(
    Math.max(addedLines.length, removedLines.length) - 1,
    indices[0] + CONTEXT_LINES,
  );

  for (let i = 1; i < indices.length; i++) {
    const idx = indices[i];
    const nextStart = Math.max(0, idx - CONTEXT_LINES);
    const nextEnd = Math.min(
      Math.max(addedLines.length, removedLines.length) - 1,
      idx + CONTEXT_LINES,
    );
    if (nextStart <= end + 2) {
      end = nextEnd;
    } else {
      windows.push({ start, end });
      start = nextStart;
      end = nextEnd;
    }
  }
  windows.push({ start, end });
  return windows;
}

export function buildContextSnippets(file, fileIssues) {
  const { addedLines, removedLines } = fileLineArrays(file);
  const indices = findImportantLineIndices(addedLines, removedLines, fileIssues);
  if (!indices.length) return [];

  const windows = buildSnippetWindows(indices, addedLines, removedLines);
  return windows.map(({ start, end }, wi) => {
    const lines = [];
    for (let i = start; i <= end; i++) {
      const removed = removedLines[i];
      const added = addedLines[i];
      const important =
        indices.includes(i) ||
        (added && /❌|FIXME|TODO/i.test(added)) ||
        (removed && /❌|FIXME|TODO/i.test(removed));

      if (removed) {
        lines.push({ type: "removed", text: removed, lineNum: i + 1, important });
      }
      if (added) {
        lines.push({ type: "added", text: added, lineNum: i + 1, important });
      }
    }
    return { id: `snippet-${wi}`, lines, collapsed: lines.length > MAX_SNIPPET_LINES };
  });
}

function fileStatusBadge(file, fileIssues) {
  const score = pickNum(file, ["riskScore", "fileScore", "score"]);
  const critical = file.backendCritical === true;
  const hasCritical = fileIssues.some((i) =>
    String(i.severity).toUpperCase().includes("CRIT"),
  );
  const hasMedium = fileIssues.some((i) =>
    String(i.severity).toUpperCase().includes("MED"),
  );

  if (critical || hasCritical || score >= 80) return "Critical";
  if (hasMedium || score >= 50 || fileIssues.length >= 5) return "Warning";
  if (fileIssues.length === 0 && score < 30) return "Safe";
  return fileIssues.length ? "Warning" : "Safe";
}

function mapIssue(issue) {
  const title = pickStr(issue, ["title"], "");
  const description = pickStr(issue, ["description"], "");
  const shortExplanation =
    pickStr(issue, ["productionImpact"], "") ||
    (description !== title ? description.replace(/^\[[^\]]+\]\s*[^-]+-\s*/, "") : "");

  return {
    id: pickStr(issue, ["id"], title),
    severity: normalizeSeverity(pickStr(issue, ["severity"], "INFO")),
    category: pickStr(issue, ["category"], ""),
    title,
    explanation: shortExplanation.slice(0, 220),
    suggestion: pickStr(issue, ["fixRecommendation"], ""),
    beforeAfter: pickStr(issue, ["fixedCodeExample"], ""),
    confidence: pickNum(issue, ["confidenceScore"], 0) || null,
  };
}

function reviewStatusLabel(raw, summary) {
  if (summary.finalDecision) {
    return summary.finalDecision.replace(/_/g, " ");
  }
  if (summary.complete === true) return "Complete";
  if (summary.complete === false) return "In progress";
  return pickStr(raw, ["status"], "Reviewed");
}

/**
 * Transform raw API response into a minimal, UI-friendly view model.
 */
export function buildReviewViewModel(apiResponse) {
  const normalized = normalizeReviewResponse(apiResponse);
  const { summary, files, issues, suggestions, raw } = normalized;

  const allIssues = dedupeIssues(issues);
  const highRisk = allIssues.filter((i) => severityRank(i.severity) <= 1).length;
  const mediumRisk = allIssues.filter((i) => severityRank(i.severity) === 2).length;
  const lowRisk = allIssues.filter((i) => severityRank(i.severity) >= 3).length;

  const suggestionCount =
    suggestions.length ||
    allIssues.filter((i) => pickStr(i, ["fixRecommendation"], "")).length;

  const viewFiles = files.map((file) => {
    const name = fileDisplayName(file);
    const fileIssues = dedupeIssues(issuesForFile(issues, name));
    const mappedIssues = fileIssues.map(mapIssue);
    const snippets = buildContextSnippets(file, fileIssues).slice(0, 3);
    const hasFindings = mappedIssues.length > 0 || snippets.length > 0;

    return {
      name,
      score: pickNum(file, ["riskScore", "fileScore", "score"]),
      riskLevel: pickStr(raw, ["riskLevel"], "") || fileStatusBadge(file, fileIssues),
      statusBadge: fileStatusBadge(file, fileIssues),
      issueCount: fileIssues.length,
      suggestionsCount: mappedIssues.filter((i) => i.suggestion).length,
      additions: pickLineCount(file, ["additions", "linesAdded"], ["addedLines"]),
      deletions: pickLineCount(file, ["deletions", "linesDeleted"], ["removedLines", "deletedLines"]),
      language: pickStr(file, ["language", "lang"], ""),
      issues: mappedIssues,
      snippets,
      showPatch: hasFindings && snippets.length > 0,
      raw: file,
    };
  });

  return {
    header: {
      repository: summary.repository,
      prNumber: summary.prNumber,
      prTitle: summary.prTitle || `Pull Request #${summary.prNumber || ""}`.trim(),
      prScore: summary.prScore,
      riskLevel: summary.riskLevel || pickStr(raw, ["riskLevel"], ""),
      finalDecision: summary.finalDecision,
      reviewStatus: reviewStatusLabel(raw, summary),
    },
    metrics: {
      prScore: summary.prScore,
      totalFiles: summary.totalFilesChanged || files.length,
      totalIssues: summary.totalIssues || allIssues.length,
      highRisk,
      mediumRisk,
      lowRisk,
      suggestions: suggestionCount,
      reviewStatus: reviewStatusLabel(raw, summary),
    },
    files: viewFiles,
    topIssues: allIssues.slice(0, 6).map(mapIssue),
    highRiskFindings: allIssues
      .filter((i) => severityRank(i.severity) <= 2)
      .map(mapIssue),
    exportPayload: apiResponse,
  };
}
