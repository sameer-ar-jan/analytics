"use client";

import React, { useMemo } from "react";

import dynamic from "next/dynamic";

const Line = dynamic(() => import("@ant-design/plots").then((plots) => plots.Line), { ssr: false, loading: () => <p role="status">Loading chart…</p> });
import { prepareChartDates } from "./chartDates";

export { resolveChartDate } from "./chartDates";

export default function LineChart(props) {
  const dates = useMemo(
    () => prepareChartDates([props.data], props.xAxisRange),
    [props.data, props.xAxisRange],
  );

  const isDecimal = (num) => {
    return num % 1;
  };

  function CommaSeparated(number) {
    if (typeof number === "number") {
      return number.toLocaleString();
    }
  }

  const COLOR_PLATE_10 = [
    "#5B8FF9",
    "#5AD8A6",
    "#5D7092",
    "#F6BD16",
    "#E8684A",
    "#6DC8EC",
    "#9270CA",
    "#FF9D4D",
    "#269A99",
    "#FF99C3",
  ];

  const config = {
    data: dates.datasets[0],
    xField: "date",
    yField: "value",
    seriesField: "category",
    meta: dates.meta,
    xAxis: dates.xAxis,
    color: [
      "#6897a7",
      "#8bc0d6",
      "#60d7a7",
      "#dedede",
      "#fedca9",
      "#fab36f",
      "#d96d6f",
    ],

    yAxis: {
      alignTick: true,
      range: [0, 1],
      label: {
        formatter: (v) => {
          if (v >= 1000000) {
            const formattedValue = (v / 1000000).toFixed(1);
            return formattedValue.endsWith(".0")
              ? `${parseInt(formattedValue)}M`
              : `${formattedValue}M`;
          } else if (v >= 1000) {
            const formattedValue = (v / 1000).toFixed(1);
            return formattedValue.endsWith(".0")
              ? `${parseInt(formattedValue)}K`
              : `${formattedValue}K`;
          } else {
            return v
              .toString()
              .replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => `${s},`);
          }
        },
      },
    },
    // xAxis: { range: [0, 3] },
    tooltip: {
      ...dates.tooltip,
      formatter: (datum) => {

        let vall =
          isDecimal(datum.value) && datum.category.toLowerCase() === "cost"
            ? CommaSeparated(Math.round(datum.value))
            : isDecimal(datum.value) && datum.category.toLowerCase() !== "cost"
              ? datum.value.toFixed(2)
              : !isDecimal(datum.value)
                ? CommaSeparated(datum.value)
                : CommaSeparated(datum.value);
        return {
          name: datum.category,
          value: vall,
        };
      },
    },
    legend: {
      position: "top",
    },
    slider: dates.slider,
  };

  return <Line {...config} />;
}
