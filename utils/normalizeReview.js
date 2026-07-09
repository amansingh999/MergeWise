import { aggregateFileStats, pickLineCount } from "./fileChange";
import { asArray, pick, pickNum, pickStr } from "./pick";

function unwrapPayload(res) {
  if (res == null) return {};
  if (typeof res !== "object") return { value: res };
  if (res.data && typeof res.data === "object" && !Array.isArray(res.data))
    return res.data;
  if (res.result && typeof res.result === "object") return res.result;
  if (res.review && typeof res.review === "object") return res.review;
  if (res.payload && typeof res.payload === "object") return res.payload;
  return res;
}

function collectIssues(root) {
  const candidates = [
    root.reviewIssues,
    root.issues,
    root.findings,
    root.problems,
    root.issueList,
    root.issueAnalysis,
    root.detectedIssues,
    root.prIssues,
  ];
  for (const c of candidates) {
    const arr = asArray(c).filter(Boolean);
    if (arr.length) return arr;
  }
  const nested = pick(root, ["analysis.issues", "review.issues", "data.issues"]);
  return asArray(nested).filter(Boolean);
}

function collectFiles(root) {
  const candidates = [
    root.changedFiles,
    root.files,
    root.fileChanges,
    root.modifiedFiles,
    root.pullRequestFiles,
  ];
  for (const c of candidates) {
    const arr = asArray(c).filter((x) => x && typeof x === "object");
    if (arr.length) return arr;
  }
  const nested = pick(root, ["analysis.files", "review.files"]);
  return asArray(nested).filter((x) => x && typeof x === "object");
}

function collectSuggestions(root) {
  const candidates = [
    root.suggestions,
    root.aiSuggestions,
    root.recommendations,
    root.improvementSuggestions,
  ];
  for (const c of candidates) {
    const arr = asArray(c).filter(Boolean);
    if (arr.length) return arr;
  }
  return [];
}

function severityOf(item) {
  return pickStr(item, [
    "severity",
    "level",
    "riskLevel",
    "priority",
    "rank",
  ]).toLowerCase();
}

function aggregateSeverityCounts(issues) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0, info: 0, other: 0 };
  for (const issue of issues) {
    const s = severityOf(issue);
    if (s.includes("crit")) counts.critical += 1;
    else if (s.includes("high") || s.includes("block")) counts.high += 1;
    else if (s.includes("med") || s.includes("warn")) counts.medium += 1;
    else if (s.includes("low") || s.includes("minor")) counts.low += 1;
    else if (s.includes("info") || s.includes("nit")) counts.info += 1;
    else counts.other += 1;
  }
  return counts;
}

function buildIssuePie(distObj, issues) {
  const fromApi = pick(distObj, [
    "issueDistribution",
    "severityDistribution",
    "issuesBySeverity",
    "distribution",
  ]);
  if (fromApi && typeof fromApi === "object" && !Array.isArray(fromApi)) {
    return Object.entries(fromApi).map(([name, value]) => ({
      name: String(name),
      value: Number(value) || 0,
    }));
  }
  const c = aggregateSeverityCounts(issues);
  return Object.entries(c)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));
}

function buildDonut(distObj, issues) {
  return buildIssuePie(distObj, issues);
}

function issuesPerFile(files, issues) {
  const map = {};
  for (const f of files) {
    const name = pickStr(f, [
      "filename",
      "fileName",
      "path",
      "filePath",
      "name",
    ]);
    if (name) map[name] = pickNum(f, ["issueCount", "issues", "issuesCount"]);
  }
  for (const issue of issues) {
    const file = pickStr(issue, ["file", "path", "filePath", "filename"]);
    if (!file) continue;
    map[file] = (map[file] || 0) + 1;
  }
  return Object.entries(map).map(([name, value]) => ({ name, issues: value }));
}

function riskTrendSeries(root) {
  const series = pick(root, [
    "riskTrend",
    "riskHistory",
    "riskTimeline",
    "trend",
    "scoresOverTime",
  ]);
  if (Array.isArray(series) && series.length) {
    return series.map((point, i) => {
      if (typeof point === "number")
        return { label: `T${i + 1}`, risk: point };
      return {
        label: pickStr(point, ["label", "step", "name", "phase"], `S${i + 1}`),
        risk: pickNum(point, ["risk", "riskScore", "value", "score"]),
      };
    });
  }
  const risk = pickNum(root, [
    "riskScore",
    "overallRisk",
    "risk",
    "highRiskFindings",
  ]);
  return [
    { label: "Baseline", risk: Math.max(0, risk - 10) },
    { label: "Current", risk },
  ];
}

function radarMetrics(root) {
  const keys = [
    ["codeQuality", "Code Quality"],
    ["maintainability", "Maintainability"],
    ["securityScore", "Security"],
    ["performanceScore", "Performance"],
    ["documentationScore", "Documentation"],
    ["testingScore", "Testing"],
    ["complexityScore", "Complexity"],
  ];
  return keys.map(([key, label]) => ({
    metric: label,
    value: pickNum(root, [key, key.replace(/Score$/, "")]),
    fullMark: 100,
  }));
}

function lineScoreBreakdown(root) {
  const breakdown = pick(root, [
    "scoreBreakdown",
    "scores",
    "categoryScores",
    "dimensions",
  ]);
  if (breakdown && typeof breakdown === "object" && !Array.isArray(breakdown)) {
    return Object.entries(breakdown).map(([k, v]) => ({
      name: k,
      score: Number(v) || 0,
    }));
  }
  return radarMetrics(root).map((r) => ({ name: r.metric, score: r.value }));
}

function heatMapCells(files, issues) {
  const sevBuckets = ["critical", "high", "medium", "low", "info"];
  const perFile = issuesPerFile(files, issues);
  return perFile.map((row) => {
    const fileIssues = issues.filter(
      (i) =>
        pickStr(i, ["file", "path", "filePath"]) === row.name ||
        row.name.endsWith(pickStr(i, ["file", "path"], "")),
    );
    const cell = {};
    for (const b of sevBuckets) cell[b] = 0;
    for (const iss of fileIssues) {
      const s = severityOf(iss);
      if (s.includes("crit")) cell.critical += 1;
      else if (s.includes("high")) cell.high += 1;
      else if (s.includes("med") || s.includes("warn")) cell.medium += 1;
      else if (s.includes("low")) cell.low += 1;
      else cell.info += 1;
    }
    return { file: row.name, ...cell, total: row.issues };
  });
}

function stackedLines(files) {
  return files.map((f) => ({
    name: pickStr(f, ["filename", "fileName", "path", "name"], "file").slice(0, 32),
    added: pickLineCount(f, ["additions", "linesAdded"], ["addedLines"]),
    deleted: pickLineCount(f, ["deletions", "linesDeleted"], ["removedLines", "deletedLines"]),
  }));
}

function extractHighRisk(root) {
  const block = pick(root, [
    "highRiskFindings",
    "highRisk",
    "criticalFindings",
    "riskDetails",
  ]);
  if (block && typeof block === "object" && !Array.isArray(block)) return block;
  return {
    items: asArray(block).filter(Boolean),
    securityRisks: pick(root, ["securityRisks", "security.risks"]),
    criticalBugs: pick(root, ["criticalBugs", "bugs.critical"]),
    memoryIssues: pick(root, ["memoryIssues"]),
    sqlInjection: pick(root, ["sqlInjection", "sqli"]),
    xss: pick(root, ["xss", "crossSiteScripting"]),
    authenticationIssues: pick(root, [
      "authenticationIssues",
      "authIssues",
    ]),
    authorizationIssues: pick(root, [
      "authorizationIssues",
      "authorization",
    ]),
    performanceBottlenecks: pick(root, [
      "performanceBottlenecks",
      "performanceIssues",
    ]),
    threadBlocking: pick(root, ["threadBlocking"]),
    raceConditions: pick(root, ["raceConditions"]),
    deadCode: pick(root, ["deadCode"]),
    nullPointer: pick(root, ["nullPointer", "nullPointers"]),
    resourceLeak: pick(root, ["resourceLeak", "resourceLeaks"]),
    dependencyIssues: pick(root, ["dependencyIssues", "dependencies.risks"]),
  };
}

function extractAiInsights(root) {
  const ins = pick(root, ["aiInsights", "insights", "intelligence", "ai"]);
  if (ins && typeof ins === "object") return ins;
  return {
    topProblems: pick(root, ["topProblems", "problems"]),
    quickWins: pick(root, ["quickWins"]),
    filesNeedingAttention: pick(root, [
      "filesNeedingAttention",
      "attentionFiles",
    ]),
    riskSummary: pickStr(root, ["riskSummary", "riskOverview"]),
    overallRecommendation: pickStr(root, [
      "overallRecommendation",
      "recommendation",
    ]),
    mergeReadinessScore: pickNum(root, ["mergeReadinessScore", "readinessScore"]),
    mergeConfidence: pickNum(root, ["mergeConfidence", "confidenceScore"]),
    shouldMerge: pick(root, ["shouldMerge", "mergeVerdict", "verdict"]),
  };
}

/**
 * Normalize arbitrary API payload into view-model + chart datasets.
 * Always retains `raw` for exhaustive rendering.
 */
export function normalizeReviewResponse(apiResponse) {
  const envelope = apiResponse && typeof apiResponse === "object" ? apiResponse : {};
  const raw = unwrapPayload(apiResponse);

  const files = collectFiles(raw);
  const issues = collectIssues(raw);
  const suggestions = collectSuggestions(raw);

  const issueDistributionObj =
    pick(raw, ["issueDistribution", "severityDistribution"]) || raw;

  const summary = {
    prScore: pickNum(raw, ["prScore", "score", "overallScore", "totalScore"]),
    overallGrade: pickStr(raw, [
      "overallGrade",
      "grade",
      "letterGrade",
      "rank",
    ]),
    overallAiComment: pickStr(raw, [
      "overallAiComment",
      "overallAIComment",
      "aiComment",
      "executiveSummary",
      "overview",
      "reviewSummary",
    ]),
    repository: pickStr(raw, [
      "repository",
      "repo",
      "repositoryName",
      "repoFullName",
      "fullName",
    ]),
    prTitle: pickStr(raw, ["prTitle", "title", "pullRequestTitle"]),
    prNumber: pickNum(raw, ["prNumber", "number", "pullRequestNumber"]),
    branch: pickStr(raw, ["branch", "headBranch", "sourceBranch"]),
    baseBranch: pickStr(raw, ["baseBranch", "targetBranch"]),
    author: pickStr(raw, ["author", "prAuthor", "user", "openedBy"]),
    reviewDate: pick(raw, ["reviewDate", "reviewedAt", "analyzedAt", "createdAt"]),
    duration: pick(raw, ["duration", "analysisDuration", "elapsedMs", "timeMs"]),
    repositoryLogo: pickStr(raw, [
      "repositoryLogo",
      "repoLogo",
      "ownerAvatarUrl",
      "avatarUrl",
    ]),
    githubUrl: pickStr(raw, [
      "githubUrl",
      "prUrl",
      "htmlUrl",
      "url",
      "pullRequestUrl",
    ]),
    totalFilesChanged: pickNum(raw, [
      "totalFilesChanged",
      "filesChanged",
      "fileCount",
    ]),
    linesAdded: pickNum(raw, ["linesAdded", "additions", "totalAdditions"]),
    linesDeleted: pickNum(raw, ["linesDeleted", "deletions", "totalDeletions"]),
    totalIssues: pickNum(raw, [
      "totalIssues",
      "issuesCount",
      "issueCount",
      "issues",
    ]),
    highRiskFindings: pickNum(raw, [
      "highRiskFindings",
      "highRiskCount",
      "criticalCount",
    ]),
    mediumFindings: pickNum(raw, ["mediumFindings", "mediumCount"]),
    lowFindings: pickNum(raw, ["lowFindings", "lowCount"]),
    suggestionsCount: suggestions.length || pickNum(raw, ["suggestionsCount"]),
    codeQuality: pickNum(raw, ["codeQuality", "qualityScore"]),
    maintainability: pickNum(raw, ["maintainability", "maintainabilityScore"]),
    securityScore: pickNum(raw, ["securityScore", "security"]),
    performanceScore: pickNum(raw, ["performanceScore", "performance"]),
    documentationScore: pickNum(raw, ["documentationScore", "documentation"]),
    testingScore: pickNum(raw, ["testingScore", "testing"]),
    complexityScore: pickNum(raw, ["complexityScore", "complexity"]),
    status: pickStr(raw, ["status", "state"], "completed"),
    message: pickStr(envelope, ["message", "msg"]),
    success: pick(envelope, ["success", "ok"]),
    requestId: pickStr(envelope, ["requestId", "id", "traceId"]),
  };

  if (!summary.totalIssues && issues.length) summary.totalIssues = issues.length;
  if (!summary.totalFilesChanged && files.length)
    summary.totalFilesChanged = files.length;
  if (!summary.overallGrade && summary.prScore)
    summary.overallGrade = ""; // filled in UI with gradeFromScore if empty

  if (!summary.linesAdded || !summary.linesDeleted) {
    const totals = aggregateFileStats(files);
    if (!summary.linesAdded) summary.linesAdded = totals.additions;
    if (!summary.linesDeleted) summary.linesDeleted = totals.deletions;
  }

  const sevCounts = aggregateSeverityCounts(issues);
  if (!summary.highRiskFindings)
    summary.highRiskFindings = sevCounts.critical + sevCounts.high;
  if (!summary.mediumFindings) summary.mediumFindings = sevCounts.medium;
  if (!summary.lowFindings)
    summary.lowFindings = sevCounts.low + sevCounts.info;

  summary.riskLevel = pickStr(raw, ["riskLevel", "overallRiskLevel"], "");
  summary.finalDecision = pickStr(raw, ["finalDecision", "decision", "verdict"], "");
  summary.complete = pick(raw, ["complete", "isComplete"]);
  summary.metadata = pick(raw, ["metadata"]);

  const charts = {
    issuePie: buildIssuePie(issueDistributionObj, issues),
    donutSeverity: buildDonut(issueDistributionObj, issues),
    issuesPerFile: issuesPerFile(files, issues),
    riskTrend: riskTrendSeries(raw),
    qualityRadar: radarMetrics(raw),
    scoreLine: lineScoreBreakdown(raw),
    heatMap: heatMapCells(files, issues),
    stackedLines: stackedLines(files),
  };

  return {
    raw,
    envelope,
    summary,
    files,
    issues,
    suggestions,
    highRisk: extractHighRisk(raw),
    aiInsights: extractAiInsights(raw),
    charts,
  };
}
