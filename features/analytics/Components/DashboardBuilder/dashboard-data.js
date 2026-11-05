import { getReportDay } from "../Charts/chartDates.js";

export const MEDIA_SOURCES = [
  { name: "Facebook", label: "FB", prefix: "Facebook" },
  { name: "Google Ads", label: "Ggl", prefix: "googleadwords" },
  { name: "IronSource", label: "IS", prefix: "ironsource" },
  { name: "AppLovin", label: "AL", prefix: "applovin" },
  { name: "Unity Ads", label: "UA", prefix: "unityads" },
  { name: "Tapjoy", label: "TJ", prefix: "tapjoy" },
  { name: "Xiaomi", label: "Xiaomi", prefix: "xiaomiglobal" },
  { name: "Swagbucks", label: "BDG", prefix: "swagbucks" },
  { name: "Mintegral", label: "MTG", prefix: "mintegral" },
  { name: "AdColony", label: "AC", prefix: "adcolony" },
  { name: "Chartboost", label: "CB", prefix: "chartboosts2s" },
  { name: "SponsorPay", label: "SP", prefix: "sponsorpay" },
];

export const DASHBOARD_GAMES = [
  { id: "2248", name: "2248" },
  { id: "sandblast", name: "SandBlast" },
  { id: "x2", name: "x2 Blocks" },
  { id: "x7", name: "Hexa" },
  { id: "MTN", name: "MTN" },
  { id: "knots", name: "Knots" },
  { id: "xblock", name: "XBlock" },
  { id: "matchme", name: "MatchMe" },
  { id: "2248china", name: "2248 China" },
  { id: "x2china", name: "x2 China" },
];

const METRICS = {
  users: { label: "New Users", field: "total_users" },
  dau: { label: "Daily Active Users", field: "DAU" },
  revenue: { label: "Ad Revenue", field: "Ad_Rev" },
  iap: { label: "In-App Purchases", field: "IAP" },
};

const numberOrZero = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const rowDate = (row) => getReportDay(row?.Install_time);

const toLocalDateKey = (timestamp) => {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export function filterDashboardRows(rows, days = 30, now = new Date()) {
  if (!Array.isArray(rows)) return [];
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(today);
  start.setDate(start.getDate() - Math.max(1, Number(days) || 30) + 1);
  const end = new Date(today);
  end.setHours(23, 59, 59, 999);

  return rows.filter((row) => {
    const timestamp = rowDate(row);
    return timestamp !== null && timestamp >= start.valueOf() && timestamp <= end.valueOf();
  });
}

export function getTotalSpend(row) {
  const explicitTotal = Number(row?.total_spend);
  if (row?.total_spend != null && row.total_spend !== "" && Number.isFinite(explicitTotal)) {
    return explicitTotal;
  }
  return MEDIA_SOURCES.reduce(
    (total, source) => total + numberOrZero(row?.[`${source.prefix}_cost`]),
    0,
  );
}

export function getMetricTotal(rows, metric) {
  if (!Array.isArray(rows)) return 0;
  if (metric === "spend") return rows.reduce((total, row) => total + getTotalSpend(row), 0);
  const field = METRICS[metric]?.field;
  if (!field) return 0;
  return rows.reduce((total, row) => total + numberOrZero(row?.[field]), 0);
}

export function buildDailySeries(rows, metric, days = 30, now = new Date()) {
  const filteredRows = filterDashboardRows(rows, days, now);
  const buckets = new Map();

  filteredRows.forEach((row) => {
    const timestamp = rowDate(row);
    if (timestamp === null) return;
    const date = new Date(timestamp);
    const key = toLocalDateKey(timestamp);
    const bucket = buckets.get(key) || { date, values: new Map() };

    if (metric === "source-spend") {
      MEDIA_SOURCES.forEach((source) => {
        const value = numberOrZero(row?.[`${source.prefix}_cost`]);
        bucket.values.set(source.label, (bucket.values.get(source.label) || 0) + value);
      });
    } else {
      const value = metric === "spend" ? getTotalSpend(row) : numberOrZero(row?.[METRICS[metric]?.field]);
      const label = metric === "spend" ? "Total Spend" : METRICS[metric]?.label || metric;
      bucket.values.set(label, (bucket.values.get(label) || 0) + value);
    }
    buckets.set(key, bucket);
  });

  return Array.from(buckets.entries())
    .sort(([first], [second]) => first.localeCompare(second))
    .flatMap(([, bucket]) => Array.from(bucket.values, ([category, value]) => ({
      date: bucket.date,
      value,
      category,
    })));
}

export function aggregateMediaSources(rows, days = 30, now = new Date()) {
  const totals = new Map(
    MEDIA_SOURCES.map((source) => [source.label, {
      ...source,
      installs: 0,
      spend: 0,
      weightedCpi: 0,
      cpiWeight: 0,
      cpiSum: 0,
      cpiCount: 0,
    }]),
  );

  filterDashboardRows(rows, days, now).forEach((row) => {
    MEDIA_SOURCES.forEach((source) => {
      const total = totals.get(source.label);
      const installs = numberOrZero(row?.[`${source.prefix}_users`]);
      const spend = numberOrZero(row?.[`${source.prefix}_cost`]);
      const cpi = numberOrZero(row?.[`${source.prefix}_cpi`]);
      total.installs += installs;
      total.spend += spend;
      if (cpi > 0) {
        total.weightedCpi += cpi * installs;
        total.cpiWeight += installs;
        total.cpiSum += cpi;
        total.cpiCount += 1;
      }
    });
  });

  return Array.from(totals.values())
    .filter((source) => source.installs || source.spend || source.cpiCount)
    .map(({ weightedCpi, cpiWeight, cpiSum, cpiCount, ...source }) => ({
      ...source,
      cpi: source.installs
        ? source.spend / source.installs
        : cpiWeight
          ? weightedCpi / cpiWeight
          : cpiCount
            ? cpiSum / cpiCount
            : 0,
    }))
    .sort((first, second) => second.spend - first.spend);
}
