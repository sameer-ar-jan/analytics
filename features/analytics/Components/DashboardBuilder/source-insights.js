import { MEDIA_SOURCES, filterDashboardRows } from "./dashboard-data.js";
import { getReportDay } from "../Charts/chartDates.js";

export const SOURCE_METRICS = {
  spend: "Spend", installs: "Installs", cpi: "CPI",
  r0: "D0 ROAS", r7: "D7 ROAS", ret1: "D1 retention", ret7: "D7 retention",
};
export const SOURCE_VIEWS = [
  ["cpi-trend", "CPI trend"], ["roas-trend", "ROAS trend"],
  ["retention-trend", "Retention trend"], ["installs-trend", "Installs trend"],
  ["ranking", "Source rankings"], ["share", "Daily source share · 100% stacked"],
  ["bubble", "Spend, ROAS & installs · Bubbles"],
  ["cpi-retention", "CPI vs retention"], ["cpi-roas", "CPI vs ROAS"],
  ["retention-roas", "Retention vs ROAS"], ["dumbbell", "D0 → D7 ROAS · Dumbbell"],
  ["slope", "D1 → D7 retention · Slope"], ["box", "Daily performance · Box plot"],
  ["distribution", "Metric distribution"], ["calendar", "Performance calendar"],
  ["correlation", "Metric correlations"], ["radar", "Source comparison · Radar"],
  ["pareto", "Source contribution · Pareto"], ["waterfall", "Period change · Waterfall"],
  ["target", "Source targets · Bullet chart"],
].map(([view, title]) => ({ type: `source-insight-${view}`, title, view, kind: "chart", engine: "source-insight" }));

function read(row, field) {
  for (const key of Array.isArray(field) ? field : [field]) {
    if (row?.[key] == null || row[key] === "") continue;
    const value = Number(row[key]);
    if (Number.isFinite(value)) return value;
  }
  return null;
}

// Never turn absent rates into zero. Weight ROAS by spend and retention by installs,
// using only rows where that particular reported rate exists.
export function summarizeSources(rows) {
  return MEDIA_SOURCES.map((source) => {
    const result = { category: source.label, name: source.name, spend: null, installs: null, cpi: null };
    const rates = Object.fromEntries(["r0", "r7", "ret1", "ret7"].map((key) => [key, []]));
    const cpis = [];
    for (const row of rows) {
      const spend = read(row, `${source.prefix}_cost`);
      const installs = read(row, `${source.prefix}_users`);
      if (spend !== null) result.spend = (result.spend ?? 0) + spend;
      if (installs !== null) result.installs = (result.installs ?? 0) + installs;
      const cpi = read(row, `${source.prefix}_cpi`);
      if (cpi !== null) cpis.push(cpi);
      for (const key of Object.keys(rates)) {
        const value = read(row, source[key]);
        if (value !== null) rates[key].push({ value, weight: Math.max(0, (key.startsWith("ret") ? installs : spend) ?? 0) });
      }
    }
    result.cpi = result.installs > 0 && result.spend !== null
      ? result.spend / result.installs
      : cpis.length ? cpis.reduce((a, b) => a + b, 0) / cpis.length : null;
    for (const [key, entries] of Object.entries(rates)) {
      const weight = entries.reduce((sum, item) => sum + item.weight, 0);
      result[key] = weight ? entries.reduce((sum, item) => sum + item.value * item.weight, 0) / weight
        : entries.length ? entries.reduce((sum, item) => sum + item.value, 0) / entries.length : null;
    }
    return result;
  }).filter((source) => Object.keys(SOURCE_METRICS).some((key) => source[key] !== null));
}

export function buildSourceInsights(rows, period, now = new Date()) {
  const selected = filterDashboardRows(rows, period, now);
  const buckets = new Map();
  for (const row of selected) {
    const timestamp = getReportDay(row.Install_time);
    if (!buckets.has(timestamp)) buckets.set(timestamp, []);
    buckets.get(timestamp).push(row);
  }
  const daily = [...buckets].sort(([a], [b]) => a - b)
    .flatMap(([timestamp, group]) => summarizeSources(group).map((source) => ({ ...source, date: new Date(timestamp) })));
  const end = typeof period === "object" ? new Date(period.end) : new Date(now);
  const start = typeof period === "object" ? new Date(period.start) : new Date(now.getFullYear(), now.getMonth(), now.getDate() - Number(period) + 1);
  start.setHours(0, 0, 0, 0); end.setHours(0, 0, 0, 0);
  // Calendar arithmetic preserves equal-length periods across daylight-saving changes.
  let length = 0;
  for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) length++;
  const previousEnd = new Date(start); previousEnd.setDate(previousEnd.getDate() - 1);
  const previousStart = new Date(start); previousStart.setDate(previousStart.getDate() - length);
  const previousRows = filterDashboardRows(rows, { start: previousStart, end: previousEnd }, now);
  return { totals: summarizeSources(selected), daily, previous: summarizeSources(previousRows), hasPrevious: previousRows.length > 0, start, end };
}

export function pearson(points, x, y) {
  const pairs = points.filter((point) => Number.isFinite(point[x]) && Number.isFinite(point[y]));
  if (pairs.length < 3) return null;
  const meanX = pairs.reduce((sum, p) => sum + p[x], 0) / pairs.length;
  const meanY = pairs.reduce((sum, p) => sum + p[y], 0) / pairs.length;
  const numerator = pairs.reduce((sum, p) => sum + (p[x] - meanX) * (p[y] - meanY), 0);
  const denominator = Math.sqrt(pairs.reduce((sum, p) => sum + (p[x] - meanX) ** 2, 0) * pairs.reduce((sum, p) => sum + (p[y] - meanY) ** 2, 0));
  return denominator ? numerator / denominator : null;
}
