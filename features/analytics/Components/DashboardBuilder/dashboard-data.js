import { getReportDay } from "../Charts/chartDates.js";

export const MEDIA_SOURCES = [
  {
    name: "Facebook",
    label: "FB",
    prefix: "Facebook",
    r0: "fb_r0",
    r7: "fb_r7",
    ret1: "facebook_ret1",
    ret7: "facebook_ret7",
  },
  {
    name: "Google Ads",
    label: "Ggl",
    prefix: "googleadwords",
    r0: "google_r0",
    r7: "google_r7",
    ret1: "googleadwords_ret1",
    ret7: ["googleadwords_ret7", "googleadwords__ret7"],
  },
  {
    name: "IronSource",
    label: "IS",
    prefix: "ironsource",
    r0: "IS_r0",
    r7: "IS_r7",
    ret1: "ironsource_ret1",
    ret7: "ironsource_ret7",
  },
  {
    name: "AppLovin",
    label: "AL",
    prefix: "applovin",
    r0: "AL_r0",
    r7: "AL_r7",
    ret1: "applovin_ret1",
    ret7: "applovin_ret7",
  },
  {
    name: "Unity Ads",
    label: "UA",
    prefix: "unityads",
    r0: "UA_r0",
    r7: "UA_r7",
    ret1: "unityads_ret1",
    ret7: "unityads_ret7",
  },
  {
    name: "Tapjoy",
    label: "TJ",
    prefix: "tapjoy",
    r0: "TJ_r0",
    r7: "TJ_r7",
    ret1: "tapjoy_ret1",
    ret7: "tapjoy_ret7",
  },
  {
    name: "Adjoe",
    label: "Adjoe",
    prefix: "xiaomiglobal",
    r0: "X_r0",
    r7: "X_r7",
    ret1: "xiaomi_ret1",
    ret7: "xiaomi_ret7",
  },
  {
    name: "Swagbucks",
    label: "Swagbucks",
    prefix: "swagbucks",
    r0: "SB_r0",
    r7: "SB_r7",
    ret1: "swagbucks_ret1",
    ret7: "swagbucks_ret7",
  },
  {
    name: "Mintegral",
    label: "MTG",
    prefix: "mintegral",
    r0: "Mint_r0",
    r7: "Mint_r7",
    ret1: "Mintint_ret1",
    ret7: "Mintint_ret7",
  },
  {
    name: "Aura",
    label: "Aura",
    prefix: "aura",
    r0: "aura_r0",
    r7: "aura_r7",
    ret1: "aura_ret1",
    ret7: "aura_ret7",
  },
  {
    name: "Liftoff",
    label: "litoff",
    prefix: "litoff",
    r0: "LO_r0",
    r7: "LO_r7",
    ret1: "LiftOff_ret1",
    ret7: "LiftOff_ret7",
  },
  {
    name: "SponsorPay",
    label: "SP",
    prefix: "sponsorpay",
    r0: "SP_r0",
    r7: "SP_r7",
    ret1: "sponserpayretention_ret1",
    ret7: "sponserpayretention_ret7",
  },
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

export function getSourceMetric(row, field) {
  const fields = Array.isArray(field) ? field : [field];
  for (const key of fields) {
    const value = Number(row?.[key]);
    if (row?.[key] != null && row[key] !== "" && Number.isFinite(value))
      return value;
  }
  return 0;
}

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
    return (
      timestamp !== null &&
      timestamp >= start.valueOf() &&
      timestamp <= end.valueOf()
    );
  });
}

export function getTotalSpend(row) {
  const explicitTotal = Number(row?.total_spend);
  if (
    row?.total_spend != null &&
    row.total_spend !== "" &&
    Number.isFinite(explicitTotal)
  ) {
    return explicitTotal;
  }
  return MEDIA_SOURCES.reduce(
    (total, source) => total + numberOrZero(row?.[`${source.prefix}_cost`]),
    0,
  );
}

export function getMetricTotal(rows, metric) {
  if (!Array.isArray(rows)) return 0;
  if (metric === "spend")
    return rows.reduce((total, row) => total + getTotalSpend(row), 0);
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

    if (metric === "source-spend" || metric === "source-installs") {
      MEDIA_SOURCES.forEach((source) => {
        const field = metric === "source-spend" ? "cost" : "users";
        const value = numberOrZero(row?.[`${source.prefix}_${field}`]);
        bucket.values.set(
          source.label,
          (bucket.values.get(source.label) || 0) + value,
        );
      });
    } else {
      const value =
        metric === "spend"
          ? getTotalSpend(row)
          : numberOrZero(row?.[METRICS[metric]?.field]);
      const label =
        metric === "spend" ? "Total Spend" : METRICS[metric]?.label || metric;
      bucket.values.set(label, (bucket.values.get(label) || 0) + value);
    }
    buckets.set(key, bucket);
  });

  return Array.from(buckets.entries())
    .sort(([first], [second]) => first.localeCompare(second))
    .flatMap(([, bucket]) =>
      Array.from(bucket.values, ([category, value]) => ({
        date: bucket.date,
        value,
        category,
      })),
    );
}

export function buildSourceTotals(
  rows,
  days = 30,
  metric = "spend",
  now = new Date(),
) {
  return aggregateMediaSources(rows, days, now).map((source) => ({
    category: source.label,
    value: metric === "users" ? source.installs : source.spend,
  }));
}

export function aggregateMediaSources(rows, days = 30, now = new Date()) {
  const totals = new Map(
    MEDIA_SOURCES.map((source) => [
      source.label,
      {
        ...source,
        installs: 0,
        spend: 0,
        weightedCpi: 0,
        cpiWeight: 0,
        cpiSum: 0,
        cpiCount: 0,
      },
    ]),
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

export function buildSourceEfficiency(rows, days = 30, now = new Date()) {
  return aggregateMediaSources(rows, days, now)
    .filter((source) => source.spend || source.installs)
    .map((source) => ({
      category: source.label,
      x: source.spend,
      y: source.installs,
      spend: source.spend,
      installs: source.installs,
    }));
}
