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
  const rows = [reportRow("2026-11-06"), reportRow("2026-11-05", { total_spend: 25 })];
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
  const result = aggregateMediaSources([
    reportRow("2026-11-06"),
    reportRow("2026-11-05", { Facebook_users: 5, Facebook_cost: 40, Facebook_cpi: 8 }),
  ], 30, now);
  assert.deepEqual(result.map(({ label }) => label), ["FB"]);
  assert.equal(result[0].installs, 15);
  assert.equal(result[0].spend, 90);
  assert.equal(result[0].cpi, 6);
});

test("media-source ROAS and retention fields support report aliases", () => {
  const row = { IS_r0: 3, IS_r7: 7, ironsource_ret1: 38, ironsource_ret7: 16, googleadwords__ret7: 9 };
  assert.equal(getSourceMetric(row, "IS_r0"), 3);
  assert.equal(getSourceMetric(row, "IS_r7"), 7);
  assert.equal(getSourceMetric(row, "ironsource_ret1"), 38);
  assert.equal(getSourceMetric(row, "ironsource_ret7"), 16);
  assert.equal(getSourceMetric(row, ["googleadwords_ret7", "googleadwords__ret7"]), 9);
});

test("source efficiency data exposes spend as x and installs as y", () => {
  const result = buildSourceEfficiency([
    reportRow("2026-11-06", { Facebook_cost: 120, Facebook_users: 30 }),
  ], 7, now);
  assert.deepEqual(result, [{
    category: "FB",
    x: 120,
    y: 30,
    spend: 120,
    installs: 30,
  }]);
});

test("source totals provide media-source categories for bar and pie charts", () => {
  const rows = [reportRow("2026-11-06", { Facebook_cost: 120, Facebook_users: 30 })];
  assert.deepEqual(buildSourceTotals(rows, 7, "spend", now), [{ category: "FB", value: 120 }]);
  assert.deepEqual(buildSourceTotals(rows, 7, "users", now), [{ category: "FB", value: 30 }]);
  const installsByDay = buildDailySeries(rows, "source-installs", 7, now);
  assert.deepEqual(installsByDay.filter(({ category, value }) => category === "FB" && value), [
    { date: new Date(2026, 10, 6), value: 30, category: "FB" },
  ]);
});

test("daily series are grouped by day and include per-source spend series", () => {
  const rows = [
    reportRow("2026-11-05", { GoogleAds_cost: 12, googleadwords_cost: 7 }),
    reportRow("2026-11-06", { googleadwords_cost: 9 }),
  ];
  const users = buildDailySeries(rows, "users", 7, now);
  assert.equal(users.length, 2);
  assert.deepEqual(users.map(({ value }) => value), [10, 10]);
  const spend = buildDailySeries(rows, "source-spend", 7, now);
  assert.deepEqual(spend.filter(({ category }) => category === "Ggl").map(({ value }) => value), [7, 9]);
});
