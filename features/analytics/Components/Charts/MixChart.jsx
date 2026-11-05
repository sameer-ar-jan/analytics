"use client";

import React, { useEffect, useMemo } from "react";
import dynamic from "next/dynamic";

const DualAxes = dynamic(
  () => import("@ant-design/plots").then((plots) => plots.DualAxes),
  { ssr: false, loading: () => <p role="status">Loading chart…</p> },
);
import syncDualAxesLayout from "./syncDualAxesLayout";
import { prepareChartDates } from "./chartDates";

export default function MixChart(props) {
  const dates = useMemo(
    () => prepareChartDates([props.data, props.data1], props.xAxisRange),
    [props.data, props.data1, props.xAxisRange],
  );
  const isDecimal = (num) => {
    return num % 1;
  };

  function CommaSeparated(number) {
    if (typeof number === "number") {
      return number.toLocaleString();
    }
  }

  useEffect(() => {}, [props]);
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
    data: dates.datasets,
    xField: "date",
    yField: ["value", "value1"],
    meta: dates.meta,
    xAxis: dates.xAxis,
    limitInPlot: true,
    onReady: syncDualAxesLayout,
    yAxis: {
      // meta: {
      //   values: [0, 1000000000000000],
      // },
      value: {
        // tickCount: ,
        alignTick: true,
        range: [0, 1],
        // values: [0, 1000000000000000],
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
      value1: {
        position: "right",

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
    },
    tooltip: {
      ...dates.tooltip,
      formatter: (datum) => {
        let vall =
          isDecimal(datum.value ? datum.value : datum.value1) &&
          datum?.category?.toLowerCase() === "cost"
            ? CommaSeparated(
                Math.round(datum.value ? datum.value : datum.value1),
              )
            : isDecimal(datum.value ? datum.value : datum.value1) &&
                datum?.category?.toLowerCase() !== "cost"
              ? datum.value
                ? datum.value.toFixed(2)
                : datum.value1.toFixed(2)
              : !isDecimal(datum.value ? datum.value : datum.value1)
                ? CommaSeparated(datum.value ? datum.value : datum.value1)
                : CommaSeparated(datum.value ? datum.value : datum.value1);
        return {
          name: datum?.category,
          value: vall,
        };
      },
    },
    legend: {
      position: "top",
      //   Title: "date",
    },
    slider: dates.slider,
    geometryOptions: [
      {
        geometry: "line",
        seriesField: "category",
      },
      {
        geometry: "line",
        seriesField: "category",
        smooth: true,
      },
    ],
  };
  return <DualAxes {...config} />;
}
