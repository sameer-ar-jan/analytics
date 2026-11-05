"use client";

import React from "react";

import dynamic from "next/dynamic";

const Area = dynamic(
  () => import("@ant-design/plots").then((plots) => plots.Area),
  { ssr: false, loading: () => <p role="status">Loading chart…</p> },
);

export default function AreaChart(props) {
  const isDecimal = (num) => {
    return num % 1;
  };

  function CommaSeparated(number) {
    if (typeof number === "number") {
      return number.toLocaleString();
    }
  }
  const config = {
    data: props.data,
    xField: "date",
    yField: "value",
    seriesField: "category",
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
        formatter: (v) =>
          `     ${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => `${s},`),
      },
    },
    tooltip: {
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
      //   Title: "date",
    },
    slider: {
      start: 0,
      end: 1,
    },
  };

  return <Area {...config} />;
}
