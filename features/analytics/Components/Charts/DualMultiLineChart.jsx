"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";

const DualAxes = dynamic(
  () => import("@ant-design/plots").then((plots) => plots.DualAxes),
  { ssr: false, loading: () => <p role="status">Loading chart…</p> },
);
import { prepareChartDates } from "./chartDates";
import syncDualAxesLayout from "./syncDualAxesLayout";

const COLORS = ["#5B8FF9", "#5AD8A6", "#5D7092", "#F6BD16", "#6F5EF9"];
const EMPTY_DATA = [];

const formatNumber = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value ?? "");
  if (Math.abs(number) >= 1000000) {
    return `${Number((number / 1000000).toFixed(1))}M`;
  }
  if (Math.abs(number) >= 1000) {
    return `${Number((number / 1000).toFixed(1))}K`;
  }
  return number.toLocaleString("en-US", { maximumFractionDigits: 2 });
};

// Existing charts use { date, value, category }. Supply data1 for a separate
// right-axis dataset, or select right-axis series from data by category.
export default function DualMultiLineChart({
  data = EMPTY_DATA,
  data1 = EMPTY_DATA,
  rightCategories = EMPTY_DATA,
  xAxisRange,
  height,
}) {
  const { leftData, rightData, categories, dates } = useMemo(() => {
    const leftData = [];
    const rightData = [];
    const categories = [];
    const rightNames = new Set(rightCategories.map(String));
    const dates = prepareChartDates([data, data1], xAxisRange);

    const addRow = (item, forceRight = false) => {
      if (!item || item.date == null || item.value == null || item.value === "")
        return;
      const date = item.date;
      const value = Number(item.value);
      if (date == null || !Number.isFinite(value)) return;
      const category = String(item.category ?? "Value");
      if (!categories.includes(category)) categories.push(category);
      const onRight = forceRight || rightNames.has(category);
      (onRight ? rightData : leftData).push({
        date,
        category,
        [onRight ? "rightValue" : "leftValue"]: value,
      });
    };

    dates.datasets[0].forEach((item) => addRow(item));
    dates.datasets[1].forEach((item) => addRow(item, true));
    // Categories assigned to the right can come from either input dataset.
    if (dates.meta.date.type === "time") {
      leftData.sort((a, b) => a.date - b.date);
      rightData.sort((a, b) => a.date - b.date);
    }
    return { leftData, rightData, categories, dates };
  }, [data, data1, rightCategories, xAxisRange]);

  if (!leftData.length && !rightData.length) {
    return (
      <div
        style={{
          height: height || "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#666",
        }}
      >
        No data
      </div>
    );
  }

  const color = ({ category }) =>
    COLORS[categories.indexOf(category) % COLORS.length];

  return (
    <DualAxes
      data={[leftData, rightData]}
      xField="date"
      yField={["leftValue", "rightValue"]}
      {...(height ? { height } : {})}
      autoFit
      limitInPlot
      onReady={syncDualAxesLayout}
      animation={false}
      meta={dates.meta}
      xAxis={dates.xAxis}
      yAxis={{
        leftValue: leftData.length
          ? { position: "left", nice: true, label: { formatter: formatNumber } }
          : false,
        rightValue: rightData.length
          ? {
              position: "right",
              nice: true,
              label: { formatter: formatNumber },
            }
          : false,
      }}
      legend={{ position: "top" }}
      slider={dates.slider}
      geometryOptions={[
        {
          geometry: "line",
          seriesField: "category",
          color,
          smooth: true,
          lineStyle: { lineWidth: 3, lineDash: [5, 5] },
        },
        {
          geometry: "line",
          seriesField: "category",
          color,
          lineStyle: { lineWidth: 3 },
          point: { size: 3, shape: "circle" },
        },
      ]}
      tooltip={{
        ...dates.tooltip,
        shared: true,
        formatter: (datum) => ({
          name: datum.category,
          value: Number(datum.leftValue ?? datum.rightValue).toLocaleString(
            "en-US",
            {
              maximumFractionDigits: 2,
            },
          ),
        }),
      }}
    />
  );
}
