import test from "node:test";
import assert from "node:assert/strict";
import {
  aggregateMediaSources,
  buildDailySeries,
  buildSourceEfficiency,
  buildSourceTotals,
  filterDashboardRows,
  getMetricTotal,
  getSourceMetric,
  getTotalSpend,
} from "../features/analytics/Components/DashboardBuilder/dashboard-data.js";

const now = new Date(2026, 10, 6, 12);
const reportRow = (date, overrides = {}) => ({
  Install_time: { value: date },
  total_users: 10,
  DAU: 6,
  Ad_Rev: 4.5,
  IAP: 2,
  Facebook_users: 10,
  Facebook_cost: 50,
  Facebook_cpi: 5,
  ...overrides,
});

test("dashboard report period includes its boundary dates and excludes older or invalid rows", () => {
  const rows = [
    reportRow("2026-11-06"),
    reportRow("2026-10-08"),
    reportRow("2026-10-07"),
    { total_users: 99 },
  ];
  assert.deepEqual(filterDashboardRows(rows, 30, now), rows.slice(0, 2));
});

test("dashboard metrics and total spend aggregate actual report fields", () => {
  const rows = [
    reportRow("2026-11-06"),
    reportRow("2026-11-05", { total_spend: 25 }),
  ];
  assert.equal(getMetricTotal(rows, "users"), 20);
  assert.equal(getMetricTotal(rows, "dau"), 12);
  assert.equal(getMetricTotal(rows, "revenue"), 9);
  assert.equal(getMetricTotal(rows, "iap"), 4);
  assert.equal(getTotalSpend(rows[0]), 50);
  assert.equal(getTotalSpend(rows[1]), 25);
  assert.equal(getMetricTotal(rows, "spend"), 75);
  assert.equal(getTotalSpend({ total_spend: null, Facebook_cost: 12 }), 12);
});

test("media-source table aggregates installs, spend, and weighted CPI", () => {
  const result = aggregateMediaSources(
    [
      reportRow("2026-11-06"),
      reportRow("2026-11-05", {
        Facebook_users: 5,
        Facebook_cost: 40,
        Facebook_cpi: 8,
      }),
    ],
    30,
    now,
  );
  assert.deepEqual(
    result.map(({ label }) => label),
    ["FB"],
  );
  assert.equal(result[0].installs, 15);
  assert.equal(result[0].spend, 90);
  assert.equal(result[0].cpi, 6);
});

test("media-source ROAS and retention fields support report aliases", () => {
  const row = {
    IS_r0: 3,
    IS_r7: 7,
    ironsource_ret1: 38,
    ironsource_ret7: 16,
    googleadwords__ret7: 9,
  };
  assert.equal(getSourceMetric(row, "IS_r0"), 3);
  assert.equal(getSourceMetric(row, "IS_r7"), 7);
  assert.equal(getSourceMetric(row, "ironsource_ret1"), 38);
  assert.equal(getSourceMetric(row, "ironsource_ret7"), 16);
  assert.equal(
    getSourceMetric(row, ["googleadwords_ret7", "googleadwords__ret7"]),
    9,
  );
});

test("source efficiency data exposes spend as x and installs as y", () => {
  const result = buildSourceEfficiency(
    [reportRow("2026-11-06", { Facebook_cost: 120, Facebook_users: 30 })],
    7,
    now,
  );
  assert.deepEqual(result, [
    {
      category: "FB",
      x: 120,
      y: 30,
      spend: 120,
      installs: 30,
    },
  ]);
});

test("source totals provide media-source categories for bar and pie charts", () => {
  const rows = [
    reportRow("2026-11-06", { Facebook_cost: 120, Facebook_users: 30 }),
  ];
  assert.deepEqual(buildSourceTotals(rows, 7, "spend", now), [
    { category: "FB", value: 120 },
  ]);
  assert.deepEqual(buildSourceTotals(rows, 7, "users", now), [
    { category: "FB", value: 30 },
  ]);
  const installsByDay = buildDailySeries(rows, "source-installs", 7, now);
  assert.deepEqual(
    installsByDay.filter(({ category, value }) => category === "FB" && value),
    [{ date: new Date(2026, 10, 6), value: 30, category: "FB" }],
  );
});

test("daily series are grouped by day and include per-source spend series", () => {
  const rows = [
    reportRow("2026-11-05", { GoogleAds_cost: 12, googleadwords_cost: 7 }),
    reportRow("2026-11-06", { googleadwords_cost: 9 }),
  ];
  const users = buildDailySeries(rows, "users", 7, now);
  assert.equal(users.length, 2);
  assert.deepEqual(
    users.map(({ value }) => value),
    [10, 10],
  );
  const spend = buildDailySeries(rows, "source-spend", 7, now);
  assert.deepEqual(
    spend
      .filter(({ category }) => category === "Ggl")
      .map(({ value }) => value),
    [7, 9],
  );
});


test("custom dashboard dates include both boundaries across metrics and chart aggregations", () => {
  const rows = [
    reportRow("2025-01-01"),
    reportRow("2025-01-02"),
    reportRow("2025-01-03"),
    reportRow("2025-01-04"),
    { total_users: 99 },
  ];
  const range = { start: new Date(2025, 0, 2), end: new Date(2025, 0, 3) };
  assert.deepEqual(filterDashboardRows(rows, range, now), rows.slice(1, 3));
  assert.equal(getMetricTotal(filterDashboardRows(rows, range), "users"), 20);
  assert.deepEqual(buildDailySeries(rows, "users", range).map(({ value }) => value), [10, 10]);
  assert.equal(buildSourceTotals(rows, range, "spend")[0].value, 100);
  assert.equal(buildSourceEfficiency(rows, range)[0].installs, 20);
  assert.deepEqual(filterDashboardRows(rows, { start: new Date(2024, 0, 1), end: new Date(2024, 0, 2) }), []);
});

const { summarizeSources, buildSourceInsights, pearson, SOURCE_VIEWS } = await import("../features/analytics/Components/DashboardBuilder/source-insights.js");

test("source insights weight reported rates, preserve zeros, and exclude absent rates", () => {
  const totals = summarizeSources([
    reportRow("2026-11-05", { Facebook_cost: 100, Facebook_users: 20, fb_r0: 0, fb_r7: 10, facebook_ret1: 50, facebook_ret7: 20 }),
    reportRow("2026-11-06", { Facebook_cost: 300, Facebook_users: 10, fb_r7: 30, facebook_ret1: 20 }),
  ]);
  assert.equal(totals.length, 1);
  assert.equal(totals[0].cpi, 400 / 30);
  assert.equal(totals[0].r0, 0);
  assert.equal(totals[0].r7, 25);
  assert.equal(totals[0].ret1, 40);
  assert.equal(totals[0].ret7, 20);
  assert.equal(summarizeSources([reportRow("2026-11-06")])[0].r7, null);
  assert.equal(summarizeSources([{ googleadwords__ret7: 12 }])[0].ret7, 12);
});

test("insights compare adjacent equal calendar periods, and aggregate duplicate source-days", () => {
  const rows = [
    reportRow("2026-11-02", { Facebook_cost: 70 }),
    reportRow("2026-11-03", { Facebook_cost: 30 }),
    reportRow("2026-11-04", { Facebook_cost: 20 }),
    reportRow("2026-11-05", { Facebook_cost: 60 }),
    reportRow("2026-11-05", { Facebook_cost: 40 }),
    reportRow("2026-11-06", { Facebook_cost: 100 }),
    reportRow("2026-11-07", { Facebook_cost: 999 }),
  ];
  const model = buildSourceInsights(rows, { start: new Date(2026, 10, 5), end: new Date(2026, 10, 6) }, now);
  assert.equal(model.totals[0].spend, 200);
  assert.equal(model.previous[0].spend, 50);
  assert.equal(model.daily.length, 2);
  assert.equal(model.daily[0].spend, 100);
  assert.equal(model.hasPrevious, true);
  assert.equal(buildSourceInsights([], 30, now).hasPrevious, false);
});

test("correlation handles missing pairs and constant metrics without fabricating results", () => {
  assert.equal(pearson([{ x: 1, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 6 }, { x: null, y: 7 }], "x", "y"), 1);
  assert.equal(pearson([{ x: 1, y: 3 }, { x: 2, y: 2 }, { x: 3, y: 1 }], "x", "y"), -1);
  assert.equal(pearson([{ x: 1, y: 2 }, { x: 1, y: 3 }, { x: 1, y: 4 }], "x", "y"), null);
  assert.equal(pearson([{ x: 1, y: 2 }], "x", "y"), null);
  assert.equal(SOURCE_VIEWS.length, 20);
  assert.equal(new Set(SOURCE_VIEWS.map((v) => v.type)).size, 20);
});
