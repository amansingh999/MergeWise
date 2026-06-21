"use client";

import dynamic from "next/dynamic";
import ChartSkeleton from "./ChartSkeleton";

const IssueDistributionPie = dynamic(() => import("./IssueDistributionPie"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
const SeverityDonut = dynamic(() => import("./SeverityDonut"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
const IssuesPerFileBar = dynamic(() => import("./IssuesPerFileBar"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
const RiskTrendArea = dynamic(() => import("./RiskTrendArea"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
const QualityRadar = dynamic(() => import("./QualityRadar"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
const ScoreLineChart = dynamic(() => import("./ScoreLineChart"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
const PrScoreGauge = dynamic(() => import("./PrScoreGauge"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
const RiskMeter = dynamic(() => import("./RiskMeter"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
const FilesHeatMap = dynamic(() => import("./FilesHeatMap"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
const LinesStackedBar = dynamic(() => import("./LinesStackedBar"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

export default function DashboardCharts({ charts, prScore, riskValue }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "0.85rem",
      }}
    >
      <IssueDistributionPie data={charts.issuePie} />
      <SeverityDonut data={charts.donutSeverity} />
      <IssuesPerFileBar data={charts.issuesPerFile} />
      <RiskTrendArea data={charts.riskTrend} />
      <QualityRadar data={charts.qualityRadar} />
      <ScoreLineChart data={charts.scoreLine} />
      <PrScoreGauge score={prScore} />
      <RiskMeter value={riskValue} />
      <FilesHeatMap rows={charts.heatMap} />
      <LinesStackedBar data={charts.stackedLines} />
    </div>
  );
}
