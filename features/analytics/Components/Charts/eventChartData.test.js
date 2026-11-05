import { buildEventChartData } from "./eventChartData";

const range = { start: new Date(2026, 9, 1), end: new Date(2026, 9, 3) };
const row = (exp_no, geo = "US", day = "2026-10-02") => ({
  exp_no,
  geo,
  date: { value: day },
  experimentVariant: "A",
  INT_count: 0,
  RV_count: "12",
});
const build = (props) =>
  buildEventChartData({ ...range, itemGeo: "All Geo", ...props });

test("All Geo derives experiments and plots directly from aggregate events without geo data", () => {
  const result = build({
    data: [row("2248-only")],
    dataGeo: [],
    dataGeolist: [],
  });
  expect(result.experiments).toEqual(["2248-only"]);
  expect(result.selectedExperiment).toBe("2248-only");
  expect(result.graphdata.INT).toEqual([
    { date: new Date(2026, 9, 2).valueOf(), value: 0, category: "A" },
  ]);
  expect(result.graphdata.RV[0].value).toBe(12);
});

test("switching games replaces an obsolete experiment with one in the new report", () => {
  const old = build({ data: [row("2248-only")] });
  const next = build({
    data: [row("x2-only")],
    itemExp: old.selectedExperiment,
    dataGeo: [row("wrong-geo-experiment")],
  });
  expect(next.selectedExperiment).toBe("x2-only");
  expect(next.graphdata.INT).toHaveLength(1);
});

test("geo reports use only experiments available for the selected country", () => {
  const result = build({
    itemGeo: "UK",
    itemExp: 42,
    data: [row("aggregate")],
    dataGeolist: [{ geo: "UK" }],
    dataGeo: [row(42, "UK"), row("42", "UK"), row(99, "US")],
  });
  expect(result.experiments).toEqual(["42"]);
  expect(result.graphdata.INT).toHaveLength(2);
  const all = build({ data: [row("aggregate")], dataGeo: [row(42, "UK")] });
  expect(all.selectedExperiment).toBe("aggregate");
});

test("date changes include boundary days, exclude other dates, and sort chronologically", () => {
  const result = build({
    data: [
      row("e", "US", "2026-10-03"),
      row("e", "US", "2026-09-30"),
      row("e", "US", "2026-10-01"),
    ],
  });
  expect(result.graphdata.INT.map((point) => point.date)).toEqual([
    new Date(2026, 9, 1).valueOf(),
    new Date(2026, 9, 3).valueOf(),
  ]);
});

test("empty or pending reports recover without retaining unavailable geo/experiment filters", () => {
  const empty = build({ data: null, itemExp: "old", itemGeo: "old-country" });
  expect(empty.selectedGeo).toBe("All Geo");
  expect(empty.selectedExperiment).toBe("");
  expect(empty.graphdata.INT).toEqual([]);
  expect(
    build({ data: [row("new")], itemExp: "old" }).graphdata.INT,
  ).toHaveLength(1);
});
