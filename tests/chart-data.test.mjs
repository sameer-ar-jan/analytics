import test from "node:test";
import assert from "node:assert/strict";
import moment from "moment";
import { getReportDay, prepareChartDates } from "../features/analytics/Components/Charts/chartDates.js";
import { buildEventChartData } from "../features/analytics/Components/Charts/eventChartData.js";

test("plain and wrapped API dates preserve the same local calendar day", () => {
  const expected = new Date(2024, 1, 29).valueOf();
  for (const date of ["2024-02-29", { value: "2024-02-29" }, new Date(expected)]) assert.equal(getReportDay(date), expected);
  for (const date of [undefined, null, "", {}, { value: null }, new Date(NaN)]) assert.equal(getReportDay(date), null);
});

test("1000 daily points remain distinct, sorted, and year-labeled on both axes", () => {
  const start = moment("2024-01-01");
  const rows = Array.from({ length: 1000 }, (_, i) => ({ date: start.clone().add(i, "days").valueOf(), value: i, category: "DAU" })).reverse();
  const original = rows.slice();
  const dates = prepareChartDates([rows, rows]);
  for (const data of dates.datasets) {
    assert.equal(new Set(data.map(row => row.date)).size, 1000);
    assert.deepEqual(data.map(row => row.date), original.map(row => row.date).reverse());
  }
  assert.deepEqual(rows, original);
  assert.equal(dates.meta.date.type, "time");
  assert.equal(dates.meta.date.nice, false);
  assert.equal(dates.xAxis.nice, false);
  assert.equal(dates.xAxis.label.formatter(new Date(2024, 4, 20).valueOf()), "20 May 2024");
  assert.equal(dates.slider.formatter(String(new Date(2026, 4, 20).valueOf())), "20 May 2026");
  assert.equal(dates.tooltip.title("", { date: new Date(2025, 4, 20) }), "20 May 2025");
});

test("selected ranges retain complete boundary days without clipping limits", () => {
  const range = { start: moment("2025-12-31"), end: moment("2026-01-01") };
  const dates = prepareChartDates([[{ date: "2026-01-01", value: 0 }]], range);
  assert.equal(dates.meta.date.min, range.start.valueOf());
  assert.equal(dates.meta.date.max, range.end.clone().endOf("day").valueOf());
  assert.equal(dates.meta.date.minLimit, undefined);
  assert.equal(dates.meta.date.maxLimit, undefined);
  assert.equal(dates.slider.formatter(range.start), "31 Dec 2025");
  assert.equal(dates.datasets[0][0].value, 0);
});

test("single-year and non-date charts retain appropriate labels", () => {
  const dates = prepareChartDates([[{ date: new Date(2026, 9, 1), value: 1 }]]);
  assert.equal(dates.xAxis.label.formatter(new Date(2026, 9, 1)), "01 Oct");
  const categories = [{ date: "B", value: 1 }, { date: "A", value: 2 }];
  const categorical = prepareChartDates([categories]);
  assert.equal(categorical.meta.date.type, "cat");
  assert.deepEqual(categorical.datasets[0], categories);
});

const range = { start: new Date(2026, 9, 1), end: new Date(2026, 9, 3) };
const row = (exp_no, geo = "US", date = "2026-10-02") => ({ exp_no, geo, date: { value: date }, experimentVariant: "A", INT_count: 0, RV_count: "12" });
const events = props => buildEventChartData({ ...range, itemGeo: "All Geo", ...props });

test("All Geo events populate independently of geo responses and stale experiment choices", () => {
  const initial = events({ data: [row("2248")], dataGeo: [] });
  assert.equal(initial.selectedExperiment, "2248");
  assert.equal(initial.graphdata.INT[0].value, 0);
  const next = events({ data: [row("x2")], dataGeo: [row("geo-only")], itemExp: "2248" });
  assert.equal(next.selectedExperiment, "x2");
  assert.equal(next.graphdata.RV[0].value, 12);
});

test("geo filtering handles numeric/string experiments without mixing countries", () => {
  const result = events({ itemGeo: "UK", itemExp: 42, dataGeolist: [{ geo: "UK" }], dataGeo: [row(42, "UK"), row("42", "UK"), row(99, "US")] });
  assert.deepEqual(result.experiments, ["42"]);
  assert.equal(result.graphdata.INT.length, 2);
});

test("event data recovers after empty reports and excludes dates outside the range", () => {
  assert.equal(events({ data: null, itemExp: "old" }).selectedExperiment, "");
  const result = events({ data: [row("new", "US", "2026-10-03"), row("new", "US", "2026-09-30"), row("new", "US", "2026-10-01")], itemExp: "old" });
  assert.equal(result.selectedExperiment, "new");
  assert.deepEqual(result.graphdata.INT.map(point => point.date), [new Date(2026, 9, 1).valueOf(), new Date(2026, 9, 3).valueOf()]);
});
