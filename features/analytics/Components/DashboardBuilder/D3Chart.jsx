"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import styles from "./dashboard.module.css";

const COLORS = ["#3978e8", "#16a58c", "#e69a27", "#8b62d9", "#df5f6b", "#3f9eb5", "#67758c", "#c06a3f", "#5c9d4e", "#bf559e", "#7184d8", "#a08a31"];
const formatNumber = (value) => {
  if (Math.abs(value) >= 1_000_000) return `${d3.format(".1f")(value / 1_000_000)}M`;
  if (Math.abs(value) >= 1_000) return `${d3.format(".1f")(value / 1_000)}K`;
  return d3.format(",.0f")(value);
};
const validRows = (data) => (Array.isArray(data) ? data : [])
  .map((item) => ({ ...item, value: Number(item.value) }))
  .filter((item) => Number.isFinite(item.value));

function renderGauge(svg, data, goal) {
  const width = 720;
  const height = 330;
  const value = d3.sum(data, (item) => item.value);
  const target = Math.max(Number(goal) || 0, 1);
  const ratio = Math.min(value / target, 1);
  const cx = width / 2;
  const cy = 258;
  const radius = 175;
  const arc = d3.arc().innerRadius(123).outerRadius(radius).cornerRadius(8);
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + Math.PI;

  svg.attr("viewBox", `0 0 ${width} ${height}`).attr("preserveAspectRatio", "xMidYMid meet");
  svg.append("text").attr("class", styles.d3ChartTitle).attr("x", 28).attr("y", 23).text("Selected period progress");
  const gauge = svg.append("g").attr("transform", `translate(${cx},${cy})`);
  gauge.append("path").attr("d", arc({ startAngle, endAngle })).attr("fill", "#e9edf4");
  gauge.append("path")
    .attr("d", arc({ startAngle, endAngle: startAngle + Math.PI * ratio }))
    .attr("fill", ratio >= 1 ? "#16a58c" : ratio >= 0.7 ? "#e69a27" : "#3978e8");

  const needleAngle = startAngle + Math.PI * ratio;
  const needleRadius = 113;
  gauge.append("line")
    .attr("x1", 0).attr("y1", 0)
    .attr("x2", Math.sin(needleAngle) * needleRadius)
    .attr("y2", -Math.cos(needleAngle) * needleRadius)
    .attr("stroke", "#29364e")
    .attr("stroke-width", 4)
    .attr("stroke-linecap", "round");
  gauge.append("circle").attr("r", 9).attr("fill", "#29364e");
  gauge.append("text")
    .attr("class", styles.d3GaugeValue)
    .attr("text-anchor", "middle")
    .attr("y", -30)
    .text(formatNumber(value));
  gauge.append("text")
    .attr("class", styles.d3GaugeCaption)
    .attr("text-anchor", "middle")
    .attr("y", -4)
    .text(`${(ratio * 100).toFixed(0)}% of goal`);
  gauge.append("text").attr("class", styles.d3GaugeScale).attr("x", -radius).attr("y", 19).attr("text-anchor", "start").text("0");
  gauge.append("text").attr("class", styles.d3GaugeScale).attr("x", radius).attr("y", 19).attr("text-anchor", "end").text(formatNumber(target));
}

function renderDonut(svg, data, title) {
  const width = 720;
  const height = 330;
  const totals = Array.from(d3.rollup(data, (items) => d3.sum(items, (item) => item.value), (item) => item.category), ([category, value]) => ({ category, value }))
    .filter((item) => item.value > 0)
    .sort((first, second) => second.value - first.value);
  if (!totals.length) return;

  svg.attr("viewBox", `0 0 ${width} ${height}`).attr("preserveAspectRatio", "xMidYMid meet");
  svg.append("text").attr("class", styles.d3ChartTitle).attr("x", 24).attr("y", 22).text(title || "Share by category");
  const group = svg.append("g").attr("transform", "translate(220,175)");
  const pie = d3.pie().sort(null).value((item) => item.value)(totals);
  const arc = d3.arc().innerRadius(62).outerRadius(125).cornerRadius(3);
  const color = d3.scaleOrdinal(totals.map((item) => item.category), COLORS);
  group.selectAll("path")
    .data(pie)
    .join("path")
    .attr("d", arc)
    .attr("fill", (item) => color(item.data.category))
    .attr("stroke", "white")
    .attr("stroke-width", 2)
    .append("title")
    .text((item) => `${item.data.category}: ${formatNumber(item.data.value)} (${(item.data.value / d3.sum(totals, (entry) => entry.value) * 100).toFixed(1)}%)`);
  group.append("text").attr("class", styles.d3GaugeValue).attr("text-anchor", "middle").attr("y", -2).text(formatNumber(d3.sum(totals, (item) => item.value)));
  group.append("text").attr("class", styles.d3GaugeCaption).attr("text-anchor", "middle").attr("y", 22).text("Total spend");

  const legend = svg.append("g").attr("transform", "translate(410,55)");
  totals.forEach((item, index) => {
    const row = legend.append("g").attr("transform", `translate(0,${index * 21})`);
    row.append("circle").attr("r", 5).attr("cy", -4).attr("fill", color(item.category));
    row.append("text").attr("class", styles.d3LegendText).attr("x", 12).attr("y", 0).text(`${item.category}  ${formatNumber(item.value)}`);
  });
}

function renderTreemap(svg, data, title) {
  const width = 720;
  const height = 330;
  const totals = Array.from(d3.rollup(data, (items) => d3.sum(items, (item) => item.value), (item) => item.category), ([name, value]) => ({ name, value }))
    .filter((item) => item.value > 0);
  if (!totals.length) return;
  svg.attr("viewBox", `0 0 ${width} ${height}`).attr("preserveAspectRatio", "xMidYMid meet");
  svg.append("text").attr("class", styles.d3ChartTitle).attr("x", 16).attr("y", 20).text(title || "Spend by source");
  const root = d3.hierarchy({ children: totals }).sum((item) => item.value);
  d3.treemap().size([width, height - 30]).paddingInner(3).paddingTop(4)(root);
  const color = d3.scaleOrdinal(totals.map((item) => item.name), COLORS);
  const cells = svg.selectAll("g").data(root.leaves()).join("g")
    .attr("transform", (item) => `translate(${item.x0},${item.y0 + 28})`);
  cells.append("rect")
    .attr("width", (item) => Math.max(0, item.x1 - item.x0))
    .attr("height", (item) => Math.max(0, item.y1 - item.y0))
    .attr("rx", 4)
    .attr("fill", (item) => color(item.data.name))
    .append("title")
    .text((item) => `${item.data.name}: ${formatNumber(item.value)}`);
  cells.filter((item) => item.x1 - item.x0 > 75 && item.y1 - item.y0 > 36)
    .append("text")
    .attr("class", styles.d3TreemapLabel)
    .attr("x", 8)
    .attr("y", 18)
    .text((item) => item.data.name);
  cells.filter((item) => item.x1 - item.x0 > 75 && item.y1 - item.y0 > 55)
    .append("text")
    .attr("class", styles.d3TreemapLabel)
    .attr("x", 8)
    .attr("y", 37)
    .text((item) => formatNumber(item.value));
}

function renderScatter(svg, data, title) {
  const width = 720;
  const height = 330;
  const margin = { top: 30, right: 24, bottom: 52, left: 62 };
  const points = data.filter((item) => Number.isFinite(Number(item.x)) && Number.isFinite(Number(item.y)));
  if (!points.length) return;
  const x = d3.scaleLinear().domain([0, d3.max(points, (item) => Number(item.x)) || 1]).nice().range([margin.left, width - margin.right]);
  const y = d3.scaleLinear().domain([0, d3.max(points, (item) => Number(item.y)) || 1]).nice().range([height - margin.bottom, margin.top]);
  const color = d3.scaleOrdinal(points.map((item) => item.category), COLORS);
  svg.attr("viewBox", `0 0 ${width} ${height}`).attr("preserveAspectRatio", "xMidYMid meet");
  svg.append("text").attr("class", styles.d3ChartTitle).attr("x", margin.left).attr("y", 18).text(title || "Spend vs installs");
  svg.append("g").attr("class", styles.d3Grid).attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(5).tickSize(-(width - margin.left - margin.right)).tickFormat(formatNumber))
    .call((axis) => axis.select(".domain").remove());
  svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(6).tickFormat(formatNumber));
  svg.append("text").attr("class", styles.d3AxisTitle).attr("x", (margin.left + width - margin.right) / 2).attr("y", height - 5).attr("text-anchor", "middle").text("Spend");
  svg.append("text").attr("class", styles.d3AxisTitle).attr("transform", "rotate(-90)").attr("x", -(margin.top + height - margin.bottom) / 2).attr("y", 15).attr("text-anchor", "middle").text("Installs");
  svg.selectAll("circle")
    .data(points)
    .join("circle")
    .attr("cx", (item) => x(item.x))
    .attr("cy", (item) => y(item.y))
    .attr("r", 6)
    .attr("fill", (item) => color(item.category))
    .attr("fill-opacity", 0.8)
    .attr("stroke", "white")
    .attr("stroke-width", 1.5)
    .append("title")
    .text((item) => `${item.category} · Spend ${formatNumber(item.x)} · Installs ${formatNumber(item.y)}`);
}

function renderHeatmap(svg, data, title) {
  const width = 720;
  const height = 330;
  const margin = { top: 44, right: 20, bottom: 40, left: 90 };
  const dates = Array.from(new Map(data.map((item) => [new Date(item.date).valueOf(), new Date(item.date)])).values()).sort((a, b) => a - b);
  const categories = Array.from(new Set(data.map((item) => item.category)));
  if (!dates.length || !categories.length) return;
  const x = d3.scaleBand().domain(dates.map((date) => date.valueOf())).range([margin.left, width - margin.right]).padding(0.06);
  const y = d3.scaleBand().domain(categories).range([margin.top, height - margin.bottom]).padding(0.08);
  const max = d3.max(data, (item) => item.value) || 1;
  const color = d3.scaleSequential(d3.interpolateYlGnBu).domain([0, max]);
  svg.attr("viewBox", `0 0 ${width} ${height}`).attr("preserveAspectRatio", "xMidYMid meet");
  svg.append("text").attr("class", styles.d3ChartTitle).attr("x", margin.left).attr("y", 20).text(title || "Daily values by category");
  svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickValues(dates.filter((_, index) => index % Math.ceil(dates.length / 7) === 0).map((date) => date.valueOf())).tickFormat((value) => d3.timeFormat("%b %d")(new Date(value))));
  svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y).tickSize(0));
  svg.selectAll("rect.heat-cell").data(data).join("rect")
    .attr("class", "heat-cell")
    .attr("x", (item) => x(new Date(item.date).valueOf()))
    .attr("y", (item) => y(item.category))
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .attr("rx", 2)
    .attr("fill", (item) => color(item.value))
    .append("title")
    .text((item) => `${item.category} · ${d3.timeFormat("%b %d, %Y")(new Date(item.date))}: ${formatNumber(item.value)}`);
}

function renderHistogram(svg, data, title) {
  const width = 720;
  const height = 330;
  const margin = { top: 32, right: 24, bottom: 48, left: 60 };
  const values = data.map((item) => item.value);
  const bins = d3.bin().domain(d3.extent(values)).thresholds(Math.min(12, Math.max(4, Math.ceil(Math.sqrt(values.length)))))(values);
  const x = d3.scaleLinear().domain(d3.extent(values)).nice().range([margin.left, width - margin.right]);
  const y = d3.scaleLinear().domain([0, d3.max(bins, (bin) => bin.length) || 1]).nice().range([height - margin.bottom, margin.top]);
  svg.attr("viewBox", `0 0 ${width} ${height}`).attr("preserveAspectRatio", "xMidYMid meet");
  svg.append("text").attr("class", styles.d3ChartTitle).attr("x", margin.left).attr("y", 18).text(title || "Distribution");
  svg.append("g").attr("class", styles.d3Grid).attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y).ticks(5).tickSize(-(width - margin.left - margin.right)))
    .call((axis) => axis.select(".domain").remove());
  svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x).ticks(7).tickFormat(formatNumber));
  svg.selectAll("rect.histogram-bin").data(bins).join("rect")
    .attr("class", "histogram-bin")
    .attr("x", (bin) => x(bin.x0) + 1)
    .attr("y", (bin) => y(bin.length))
    .attr("width", (bin) => Math.max(0, x(bin.x1) - x(bin.x0) - 2))
    .attr("height", (bin) => y(0) - y(bin.length))
    .attr("fill", "#3978e8")
    .attr("fill-opacity", 0.82)
    .append("title")
    .text((bin) => `${formatNumber(bin.x0)}–${formatNumber(bin.x1)}: ${bin.length} days`);
}

function renderCartesian(svg, data, chartType, title) {
  const width = 720;
  const height = 330;
  const margin = { top: 28, right: 22, bottom: 52, left: 58 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const parsed = data.map((item) => ({ ...item, date: new Date(item.date) }))
    .filter((item) => Number.isFinite(item.date.valueOf()));
  if (!parsed.length) return;

  const categories = Array.from(new Set(parsed.map((item) => item.category)));
  const color = d3.scaleOrdinal(categories, COLORS);
  const dates = Array.from(new Map(parsed.map((item) => [item.date.valueOf(), item.date])).values()).sort((a, b) => a - b);
  const minDate = dates[0];
  const maxDate = dates.at(-1);
  const stacked = chartType === "stacked-bar" || chartType === "stacked-area";
  const byDate = dates.map((date) => {
    const record = { date: date.valueOf() };
    parsed.filter((item) => item.date.valueOf() === date.valueOf()).forEach((item) => { record[item.category] = item.value; });
    return record;
  });
  const stack = stacked ? d3.stack().keys(categories)(byDate) : [];
  const yMaximum = stacked
    ? d3.max(byDate, (record) => d3.sum(categories, (category) => record[category] || 0)) || 0
    : d3.max(parsed, (item) => item.value) || 0;
  const x = d3.scaleTime().domain(minDate.valueOf() === maxDate.valueOf()
    ? [new Date(minDate.valueOf() - 12 * 60 * 60 * 1000), new Date(maxDate.valueOf() + 12 * 60 * 60 * 1000)]
    : [minDate, maxDate]).range([0, innerWidth]);
  const y = d3.scaleLinear().domain([0, yMaximum === 0 ? 1 : yMaximum]).nice().range([innerHeight, 0]);
  let positionForDate = (date) => x(date);

  svg.attr("viewBox", `0 0 ${width} ${height}`).attr("preserveAspectRatio", "xMidYMid meet");
  svg.append("text").attr("class", styles.d3ChartTitle).attr("x", margin.left).attr("y", 16).text(title || "Report data");
  const plot = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  plot.append("g").attr("class", styles.d3Grid).call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth).tickFormat(formatNumber))
    .call((axis) => axis.select(".domain").remove());
  plot.append("g").attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x).ticks(Math.min(7, dates.length)).tickFormat(d3.timeFormat("%b %d")))
    .call((axis) => axis.select(".domain").attr("stroke", "#d9deea"))
    .selectAll("text").attr("transform", "rotate(-25)").attr("text-anchor", "end").attr("dx", "-0.5em").attr("dy", "0.5em");

  if (chartType === "stacked-area") {
    plot.selectAll("path.stacked-area").data(stack).join("path")
      .attr("class", "stacked-area")
      .attr("fill", (series) => color(series.key))
      .attr("fill-opacity", 0.78)
      .attr("d", d3.area().x((item) => x(new Date(item.data.date))).y0((item) => y(item[0])).y1((item) => y(item[1])).curve(d3.curveMonotoneX));
  } else if (chartType === "stacked-bar") {
    const xBand = d3.scaleBand().domain(dates.map((date) => date.valueOf())).range([0, innerWidth]).padding(0.18);
    positionForDate = (date) => xBand(date.valueOf()) + xBand.bandwidth() / 2;
    plot.selectAll("g.stacked-series").data(stack).join("g")
      .attr("class", "stacked-series")
      .attr("fill", (series) => color(series.key))
      .selectAll("rect").data((series) => series).join("rect")
      .attr("x", (item) => xBand(item.data.date))
      .attr("y", (item) => y(item[1]))
      .attr("height", (item) => Math.max(0, y(item[0]) - y(item[1])))
      .attr("width", xBand.bandwidth())
      .append("title").text((item) => `${item.data.date}: ${formatNumber(item[1] - item[0])}`);
  } else if (chartType === "bar") {
    const xBand = d3.scaleBand().domain(dates.map((date) => date.valueOf())).range([0, innerWidth]).padding(0.18);
    const categoryBand = d3.scaleBand().domain(categories).range([0, xBand.bandwidth()]).padding(0.08);
    positionForDate = (date) => xBand(date.valueOf()) + xBand.bandwidth() / 2;
    plot.append("g").selectAll("g").data(dates).join("g")
      .attr("transform", (date) => `translate(${xBand(date.valueOf())},0)`)
      .selectAll("rect").data((date) => parsed.filter((item) => item.date.valueOf() === date.valueOf())).join("rect")
      .attr("x", (item) => categoryBand(item.category))
      .attr("y", (item) => y(item.value))
      .attr("width", categoryBand.bandwidth())
      .attr("height", (item) => innerHeight - y(item.value))
      .attr("rx", 2).attr("fill", (item) => color(item.category))
      .append("title").text((item) => `${item.category} · ${d3.timeFormat("%b %d")(item.date)}: ${d3.format(",.2f")(item.value)}`);
  } else {
    categories.forEach((category) => {
      const series = parsed.filter((item) => item.category === category).sort((a, b) => a.date - b.date);
      if (chartType === "area") {
        plot.append("path").datum(series).attr("fill", color(category)).attr("fill-opacity", categories.length > 1 ? 0.13 : 0.23)
          .attr("d", d3.area().x((item) => x(item.date)).y0(y(0)).y1((item) => y(item.value)).curve(d3.curveMonotoneX));
      }
      plot.append("path").datum(series).attr("fill", "none").attr("stroke", color(category)).attr("stroke-width", 2.5)
        .attr("d", d3.line().x((item) => x(item.date)).y((item) => y(item.value)).curve(d3.curveMonotoneX));
      plot.append("g").selectAll("circle").data(series).join("circle").attr("cx", (item) => x(item.date)).attr("cy", (item) => y(item.value))
        .attr("r", 2.5).attr("fill", color(category)).append("title")
        .text((item) => `${category} · ${d3.timeFormat("%b %d")(item.date)}: ${d3.format(",.2f")(item.value)}`);
    });
  }

  const interaction = plot.append("g").attr("pointer-events", "none");
  const crosshair = interaction.append("line").attr("class", styles.d3Crosshair).attr("y1", 0).attr("y2", innerHeight).style("display", "none");
  const focusPoints = interaction.append("g").style("display", "none");
  const tooltip = interaction.append("g").attr("class", styles.d3Tooltip).style("display", "none");
  const overlay = plot.append("rect").attr("class", styles.d3InteractionOverlay).attr("width", innerWidth).attr("height", innerHeight)
    .style("fill", "transparent").style("cursor", "crosshair")
    .on("pointermove", (event) => {
      const [pointerX, pointerY] = d3.pointer(event, plot.node());
      const date = dates.reduce((closest, candidate) => Math.abs(positionForDate(candidate) - pointerX) < Math.abs(positionForDate(closest) - pointerX) ? candidate : closest);
      const dateRows = parsed.filter((item) => item.date.valueOf() === date.valueOf());
      if (!dateRows.length) return;
      const anchorX = positionForDate(date);
      crosshair.attr("x1", anchorX).attr("x2", anchorX).style("display", null);
      focusPoints.selectAll("circle").data(dateRows, (item) => item.category).join("circle")
        .attr("cx", anchorX).attr("cy", (item) => y(item.value)).attr("r", 4.5).attr("fill", (item) => color(item.category)).attr("stroke", "white").attr("stroke-width", 1.5);
      focusPoints.style("display", null);
      const labels = dateRows.map((item) => `${item.category}: ${d3.format(",.2f")(item.value)}`);
      const boxWidth = Math.min(250, Math.max(130, ...labels.map((label) => label.length * 6.5 + 20)));
      const boxHeight = 29 + labels.length * 17;
      const tooltipX = Math.max(0, Math.min(anchorX + 12, innerWidth - boxWidth));
      const tooltipY = Math.max(0, Math.min(pointerY - boxHeight - 12, innerHeight - boxHeight));
      tooltip.selectAll("*").remove();
      tooltip.append("rect").attr("width", boxWidth).attr("height", boxHeight).attr("rx", 6).attr("class", styles.d3TooltipPanel);
      tooltip.append("text").attr("x", 10).attr("y", 18).attr("class", styles.d3TooltipDate).text(d3.timeFormat("%b %d, %Y")(date));
      labels.forEach((label, index) => tooltip.append("text").attr("x", 10).attr("y", 37 + index * 17).attr("class", styles.d3TooltipValue).attr("fill", color(dateRows[index].category)).text(label.length > 34 ? `${label.slice(0, 31)}…` : label));
      tooltip.attr("transform", `translate(${tooltipX},${tooltipY})`).style("display", null);
    })
    .on("pointerleave", () => { crosshair.style("display", "none"); focusPoints.style("display", "none"); tooltip.style("display", "none"); });
  overlay.raise();
  interaction.raise();

  const legend = svg.append("g").attr("transform", `translate(${margin.left},${height - 8})`);
  let offset = 0;
  categories.forEach((category) => {
    const item = legend.append("g").attr("transform", `translate(${offset},0)`);
    item.append("circle").attr("r", 4).attr("cy", -3).attr("fill", color(category));
    const label = item.append("text").attr("class", styles.d3LegendText).attr("x", 9).attr("y", 1).text(category);
    offset += (label.node()?.getComputedTextLength() || category.length * 7) + 28;
  });
}

export default function D3Chart({ data, chartType = "line", title, goal = 100000 }) {
  const svgRef = useRef(null);
  const [gaugeGoal, setGaugeGoal] = useState(goal);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const rows = chartType === "scatter"
      ? (Array.isArray(data) ? data.filter((item) => Number.isFinite(Number(item.x)) && Number.isFinite(Number(item.y))) : [])
      : validRows(data);
    if (!rows.length) return;

    if (chartType === "gauge") {
      renderGauge(svg, rows, gaugeGoal);
    } else if (chartType === "donut") {
      renderDonut(svg, rows, title);
    } else if (chartType === "treemap") {
      renderTreemap(svg, rows, title);
    } else if (chartType === "heatmap") {
      renderHeatmap(svg, rows, title);
    } else if (chartType === "scatter") {
      renderScatter(svg, rows, title);
    } else if (chartType === "histogram") {
      renderHistogram(svg, rows, title);
    } else {
      renderCartesian(svg, rows, chartType, title);
    }
  }, [data, chartType, title, gaugeGoal]);

  return (
    <div className={chartType === "gauge" ? styles.gaugeWidget : styles.d3ChartContainer}>
      {chartType === "gauge" && (
        <label className={styles.gaugeTarget}>
          Goal
          <input type="number" min="1" value={gaugeGoal} onChange={(event) => setGaugeGoal(Math.max(1, Number(event.target.value) || 1))} />
        </label>
      )}
      <svg
        ref={svgRef}
        className={styles.d3Chart}
        role="img"
        aria-label={`${title || "Report"} ${chartType} chart`}
      />
    </div>
  );
}
