import moment from "moment";
import {
  getReportDay,
  prepareChartDates,
  resolveChartDate,
} from "./chartDates";

test("game report date formats produce identical historical days before filtering", () => {
  const start = moment("2024-02-29T18:00:00");
  const end = moment("2024-03-01T10:00:00");
  for (const value of [
    "2024-02-29",
    { value: "2024-02-29" },
    new Date(2024, 1, 29),
  ]) {
    const day = getReportDay(value);
    expect(day).toBe(new Date(2024, 1, 29).valueOf());
    expect(moment(day).isBetween(start, end, "day", "[]")).toBe(true);
  }
  expect(getReportDay({ value: "2025-02-28" })).toBe(
    new Date(2025, 1, 28).valueOf(),
  );
  for (const value of [
    null,
    undefined,
    "",
    {},
    { value: null },
    { value: "" },
    new Date(NaN),
  ]) {
    expect(getReportDay(value)).toBeNull();
  }
});

test("1000 daily points keep their year and chronological order on both axes", () => {
  const start = moment("2024-01-01");
  const rows = Array.from({ length: 1000 }, (_, index) => ({
    date: start.clone().add(index, "days").valueOf(),
    category: "IS",
    value: index,
  })).reverse();
  const original = rows.slice();
  const dates = prepareChartDates([
    rows,
    rows.map((row) => ({ ...row, value1: row.value })),
  ]);

  dates.datasets.forEach((data) => {
    expect(data).toHaveLength(1000);
    expect(new Set(data.map((row) => row.date)).size).toBe(1000);
    expect(data.map((row) => row.date)).toEqual(
      original.map((row) => row.date).reverse(),
    );
    expect(
      data.find((row) => row.date === moment("2024-02-29").valueOf()),
    ).toBeDefined();
  });
  expect(rows).toEqual(original);
  expect(dates.meta.date.type).toBe("time");
  expect(dates.meta.date.nice).toBe(false);
  expect(dates.xAxis.nice).toBe(false);
  const sameDay = [2024, 2025, 2026].map((year) =>
    new Date(year, 4, 20).getTime(),
  );
  expect(sameDay.map(dates.xAxis.label.formatter)).toEqual([
    "20 May 2024",
    "20 May 2025",
    "20 May 2026",
  ]);
  expect(dates.slider.formatter(String(sameDay[0]))).toBe("20 May 2024");
  expect(dates.tooltip.title("ignored", { date: sameDay[2] })).toBe(
    "20 May 2026",
  );
});

test("popup ranges include complete boundary days and show years across New Year", () => {
  const range = { start: moment("2025-12-31"), end: moment("2026-01-01") };
  const dates = prepareChartDates([[{ date: "2026-01-01", value: 0 }]], range);
  expect(dates.meta.date.min.valueOf()).toBe(range.start.valueOf());
  expect(dates.meta.date.max.valueOf()).toBe(
    range.end.clone().endOf("day").valueOf(),
  );
  expect(dates.meta.date.minLimit).toBeUndefined();
  expect(dates.meta.date.maxLimit).toBeUndefined();
  expect(dates.slider.formatter(range.start)).toBe("31 Dec 2025");
  expect(dates.slider.formatter(range.end)).toBe("01 Jan 2026");
  expect(dates.datasets[0][0].value).toBe(0);
  expect(range.end.hour()).toBe(0);
});

test("single-year labels stay compact, while full dates remain in tooltip titles", () => {
  const date = new Date(2026, 9, 1);
  const dates = prepareChartDates([[{ date, value: 7 }]]);
  expect(dates.datasets[0][0].date).toBe(date.valueOf());
  expect(dates.xAxis.label.formatter(date.valueOf())).toBe("01 Oct");
  expect(dates.tooltip.title("", { date })).toBe("01 Oct 2026");
});

test("categorical charts keep their labels and ordering", () => {
  const rows = [
    { date: "B", value: 1 },
    { date: "A", value: 2 },
  ];
  const dates = prepareChartDates([rows]);
  expect(dates.datasets[0]).toEqual(rows);
  expect(dates.meta.date.type).toBe("cat");
  expect(dates.xAxis.label.formatter).toBeUndefined();
});

test("invalid dates are removed and legacy leap-day labels resolve only in leap years", () => {
  const dates = prepareChartDates([
    [{ date: new Date("invalid") }, { date: NaN }],
  ]);
  expect(dates.datasets[0]).toEqual([]);
  expect(
    resolveChartDate("29 Feb", {
      start: new Date(2023, 0, 1),
      end: new Date(2024, 11, 31),
    }),
  ).toBe(new Date(2024, 1, 29).valueOf());
});
