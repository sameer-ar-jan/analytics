/** @jest-environment node */
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Line, DualAxes } from "@ant-design/plots";
import LineChart from "./LineChart";
import MixChart from "./MixChart";
import syncDualAxesLayout from "./syncDualAxesLayout";
import DualMultiLineChart from "./DualMultiLineChart";

jest.mock("@ant-design/plots", () => ({
  Line: jest.fn(() => null),
  DualAxes: jest.fn(() => null),
}));

const range = { start: new Date(2026, 9, 1), end: new Date(2026, 9, 3) };
const row = (category, value) => ({ date: range.start, category, value });

beforeEach(() => jest.clearAllMocks());

test("the simple chart remains available without popup props", () => {
  renderToStaticMarkup(<LineChart data={[row("New", 7)]} />);
  expect(Line).toHaveBeenCalledTimes(1);
});

test("two left and three right series have unique colors and independent axes", () => {
  renderToStaticMarkup(
    <DualMultiLineChart
      data={[row("uv", 350), row("bill", 220)]}
      data1={[row("a", 800), row("b", 750), row("c", 900)]}
    />,
  );
  const config = DualAxes.mock.calls[0][0];
  expect(config.yField).toEqual(["leftValue", "rightValue"]);
  expect(config.limitInPlot).toBe(true);
  expect(config.onReady).toBe(syncDualAxesLayout);
  expect(config.data.map((rows) => rows.length)).toEqual([2, 3]);
  expect(config.yAxis.leftValue.position).toBe("left");
  expect(config.yAxis.rightValue.position).toBe("right");
  expect(config.geometryOptions[0].smooth).toBe(true);
  expect(config.geometryOptions[0].lineStyle.lineDash).toEqual([5, 5]);
  expect(config.geometryOptions[1].point.size).toBe(3);
  const colors = config.data.flat().map(config.geometryOptions[0].color);
  expect(new Set(colors).size).toBe(5);
});

test("New/DAU keeps zero values and the selected date range on a time axis", () => {
  renderToStaticMarkup(
    <DualMultiLineChart
      data={[row("New", 0), row("DAU", 18000)]}
      rightCategories={["DAU"]}
      xAxisRange={range}
      height={448}
    />,
  );
  const config = DualAxes.mock.calls[0][0];
  expect(config.data[0][0].leftValue).toBe(0);
  expect(config.data[1][0].rightValue).toBe(18000);
  expect(config.meta.date.type).toBe("time");
  expect(config.meta.date.min).toBe(range.start.valueOf());
  expect(new Date(config.meta.date.max).getDate()).toBe(3);
  expect(new Date(config.meta.date.max).getHours()).toBe(23);
  expect(config.height).toBe(448);
  expect(config.slider).toMatchObject({ start: 0, end: 1 });
  expect(config.slider.formatter(range.start)).toBe("01 Oct");
  expect(config.tooltip.formatter(config.data[0][0]).value).toBe("0");
  expect(config.tooltip.formatter(config.data[1][0]).value).toBe("18,000");
});

test("same-unit country series share one scale", () => {
  renderToStaticMarkup(
    <DualMultiLineChart data={[row("US", 70), row("UK", 30)]} />,
  );
  const config = DualAxes.mock.calls[0][0];
  expect(config.data[0]).toHaveLength(2);
  expect(config.data[1]).toHaveLength(0);
  expect(config.yAxis.rightValue).toBe(false);
});

test("empty or invalid data shows an empty state", () => {
  expect(renderToStaticMarkup(<DualMultiLineChart />)).toContain("No data");
  expect(
    renderToStaticMarkup(
      <DualMultiLineChart data={[row("Other", NaN), row("Other", null)]} />,
    ),
  ).toContain("No data");
  expect(DualAxes).not.toHaveBeenCalled();
});

test("legacy comparison cards use the same alignment fix and plot clipping", () => {
  renderToStaticMarkup(<MixChart data={[row("IS", 20)]} data1={[]} />);
  const config = DualAxes.mock.calls[0][0];
  expect(config.limitInPlot).toBe(true);
  expect(config.onReady).toBe(syncDualAxesLayout);
});

test.each([
  ["simple graph", LineChart, Line],
  ["dual-axis graph", MixChart, DualAxes],
  ["popup graph", DualMultiLineChart, DualAxes],
])(
  "%s separates repeated day/month dates across three years",
  (name, Chart, Plot) => {
    const dates = [2026, 2024, 2025].map((year) =>
      new Date(year, 4, 20).valueOf(),
    );
    renderToStaticMarkup(
      <Chart
        data={dates.flatMap((date, index) => [
          { date, category: "IS", value: index },
          { date, category: "RV", value: 100 + index },
        ])}
        data1={dates.map((date, index) => ({
          date,
          category: "BR",
          value: index,
          value1: index,
        }))}
      />,
    );
    const config = Plot.mock.calls[0][0];
    const datasets = Plot === Line ? [config.data] : config.data;
    datasets.forEach((data) => {
      expect(new Set(data.map((row) => row.date)).size).toBe(3);
      expect(data.map((row) => row.date)).toEqual(
        data.map((row) => row.date).sort((a, b) => a - b),
      );
    });
    expect(config.meta.date.type).toBe("time");
    expect(config.xAxis.label.formatter(dates[0])).toBe("20 May 2026");
    expect(config.slider.formatter(dates[1])).toBe("20 May 2024");
    expect(config.tooltip.title("", { date: dates[2] })).toBe("20 May 2025");
  },
);
