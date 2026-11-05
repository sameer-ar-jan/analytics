"use client";

import React, { useEffect, useId, useRef } from "react";
import * as d3 from "d3";

const colors = [
  "#247cff",
  "#17c9b1",
  "#a354f5",
  "#ffad3b",
  "#60bd66",
  "#8053ee",
];
const channels = ["Organic", "Direct", "Referral", "Social", "Email", "Paid"];

export default function WidgetRenderer({ widget, days = 30 }) {
  const ref = useRef(null);
  const uid = useId().replace(/:/g, "");
  useEffect(() => {
    if (!widget) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    const W = 500,
      H = 260;
    svg.attr("viewBox", `0 0 ${W} ${H}`);
    const type =
      { revenue: "bars", dau: "traffic", retention: "area", roas: "scatter" }[
        widget.type
      ] || widget.type;
    const tip = (selection, label) => selection.append("title").text(label);
    const gradient = (color, index) => {
      const id = `gradient-${uid}-${index}`;
      const g = svg
        .append("defs")
        .append("linearGradient")
        .attr("id", id)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");
      g.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", color)
        .attr("stop-opacity", 0.65);
      g.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", color)
        .attr("stop-opacity", 0.08);
      return `url(#${id})`;
    };
    if (type === "device") {
      const data = [56.3, 32.7, 11];
      const arc = d3.arc().innerRadius(77).outerRadius(111);
      const g = svg.append("g").attr("transform", "translate(132,130)");
      tip(
        g
          .selectAll("path")
          .data(d3.pie().sort(null)(data))
          .join("path")
          .attr("d", arc)
          .attr("fill", (_, i) => colors[i])
          .attr("stroke", "white")
          .attr("stroke-width", 2),
        (d) => `${["Desktop", "Mobile", "Tablet"][d.index]}: ${d.value}%`,
      );
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", -1)
        .attr("font-size", 25)
        .attr("font-weight", 750)
        .text(d3.format(",")(Math.round((124893 * days) / 30)));
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", 23)
        .text("Users");
      ["Desktop", "Mobile", "Tablet"].forEach((label, i) => {
        svg
          .append("circle")
          .attr("cx", 280)
          .attr("cy", 82 + i * 45)
          .attr("r", 7)
          .attr("fill", colors[i]);
        svg
          .append("text")
          .attr("x", 296)
          .attr("y", 87 + i * 45)
          .text(label);
        svg
          .append("text")
          .attr("x", 480)
          .attr("y", 87 + i * 45)
          .attr("text-anchor", "end")
          .text(`${data[i]}%`);
      });
      return;
    }
    if (type === "treemap") {
      const names = [
        "/ (Home)",
        "/products",
        "/blog",
        "/pricing",
        "/docs",
        "/analytics",
        "/about",
        "Other",
      ];
      const values = [28.4, 16.7, 12.1, 10.3, 9.6, 8.9, 7.4, 6.6];
      const root = d3
        .hierarchy({
          children: names.map((name, i) => ({ name, value: values[i] })),
        })
        .sum((d) => d.value);
      d3
        .treemap()
        .tile(d3.treemapSquarify)
        .size([W, H])
        .paddingInner(3)
        .round(true)(root);
      const cells = svg
        .selectAll("g")
        .data(root.leaves())
        .join("g")
        .attr("transform", (d) => `translate(${d.x0},${d.y0})`);
      tip(
        cells
          .append("rect")
          .attr("width", (d) => d.x1 - d.x0)
          .attr("height", (d) => d.y1 - d.y0)
          .attr("rx", 7)
          .attr("fill", (_, i) => [...colors, "#00bca4", "#c1a4ff"][i]),
        (d) => `${d.data.name}: ${d.value}%`,
      );
      cells
        .append("text")
        .attr("x", 12)
        .attr("y", 26)
        .attr("fill", "white")
        .attr("font-weight", 600)
        .text((d) => d.data.name);
      cells
        .append("text")
        .attr("x", 12)
        .attr("y", 48)
        .attr("fill", "white")
        .text((d) => `${d.value}%`);
      return;
    }
    const margin = {
      top: 27,
      right: type === "scatter" ? 105 : 15,
      bottom: 35,
      left: 48,
    };
    const w = W - margin.left - margin.right,
      h = H - margin.top - margin.bottom;
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    const x =
      type === "bars"
        ? d3.scaleBand().domain(channels).range([0, w]).padding(0.23)
        : d3
            .scaleLinear()
            .domain(type === "scatter" ? [1, 8] : [1, days])
            .range([0, w]);
    const max =
      type === "scatter"
        ? 10
        : type === "bars"
          ? 25000
          : type === "area"
            ? 25000
            : 40000;
    const y = d3.scaleLinear().domain([0, max]).range([h, 0]);
    g.append("g")
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickSize(-w)
          .tickFormat((d) =>
            type === "scatter"
              ? d
              : `${type === "bars" ? "$" : ""}${d === 0 ? 0 : d / 1000 + "K"}`,
          ),
      )
      .call((a) => a.select(".domain").remove())
      .call((a) => a.selectAll("line").attr("stroke", "#e9edf5"));
    g.append("g")
      .attr("transform", `translate(0,${h})`)
      .call(
        type === "bars"
          ? d3.axisBottom(x).tickSize(0)
          : d3
              .axisBottom(x)
              .ticks(7)
              .tickSize(0)
              .tickFormat((d) =>
                type === "scatter" ? d : `Day ${Math.round(d)}`,
              ),
      )
      .call((a) => a.select(".domain").attr("stroke", "#e5e9f1"))
      .selectAll("text")
      .attr("dy", "1.2em");
    if (type === "bars") {
      tip(
        g
          .selectAll("rect")
          .data(
            [21500, 16300, 11200, 7900, 6100, 13800].map(
              (v) => (v * days) / 30,
            ),
          )
          .join("rect")
          .attr("x", (_, i) => x(channels[i]))
          .attr("y", (d) => y(d))
          .attr("width", x.bandwidth())
          .attr("height", (d) => h - y(d))
          .attr("rx", 5)
          .attr("fill", (_, i) => colors[i]),
        (d, i) => `${channels[i]}: $${d3.format(",.0f")(d)}`,
      );
    } else if (type === "scatter") {
      const data = d3.range(65).map((i) => ({
        x: 1.5 + ((i * 1.37) % 6),
        y: 1.5 + ((i * 1.37) % 6) + Math.sin(i * 3) * 1.3,
        group: i % 5,
      }));
      tip(
        g
          .selectAll("circle")
          .data(data)
          .join("circle")
          .attr("cx", (d) => x(d.x))
          .attr("cy", (d) => y(d.y))
          .attr("r", 5.5)
          .attr("fill", (d) => colors[d.group])
          .attr("opacity", 0.7)
          .attr("stroke", "white"),
        (d) =>
          `${channels[d.group]}: ${d.x.toFixed(1)} pages, ${d.y.toFixed(1)} min`,
      );
      channels.slice(0, 5).forEach((name, i) => {
        svg
          .append("circle")
          .attr("cx", 408)
          .attr("cy", 60 + i * 27)
          .attr("r", 5)
          .attr("fill", colors[i]);
        svg
          .append("text")
          .attr("x", 420)
          .attr("y", 64 + i * 27)
          .attr("font-size", 12)
          .text(name);
      });
      svg
        .append("text")
        .attr("x", 215)
        .attr("y", 258)
        .attr("text-anchor", "middle")
        .text("Pages per session · duration (min)");
    } else {
      const data = d3.range(days).map((i) => ({
        day: i + 1,
        value: 11500 + i * 690 + Math.sin(i * 0.8) * 2300,
      }));
      const series =
        type === "area"
          ? [{ label: "Active users", color: "#16c66b", factor: 0.67 }]
          : [
              { label: "Users", color: colors[0], factor: 1 },
              { label: "Sessions", color: colors[2], factor: 0.64 },
            ];
      series.forEach((s, index) => {
        const line = d3
          .line()
          .x((d) => x(d.day))
          .y((d) => y(d.value * s.factor))
          .curve(d3.curveMonotoneX);
        g.append("path")
          .datum(data)
          .attr(
            "d",
            d3
              .area()
              .x((d) => x(d.day))
              .y0(h)
              .y1((d) => y(d.value * s.factor))
              .curve(d3.curveMonotoneX),
          )
          .attr("fill", gradient(s.color, index));
        g.append("path")
          .datum(data)
          .attr("d", line)
          .attr("fill", "none")
          .attr("stroke", s.color)
          .attr("stroke-width", 3);
        tip(
          g
            .selectAll(`.point-${index}`)
            .data(data)
            .join("circle")
            .attr("class", `point-${index}`)
            .attr("cx", (d) => x(d.day))
            .attr("cy", (d) => y(d.value * s.factor))
            .attr("r", type === "area" ? 4 : 4.5)
            .attr("fill", s.color)
            .attr("stroke", "white")
            .attr("stroke-width", 2),
          (d) =>
            `Day ${d.day} · ${s.label}: ${d3.format(",.0f")(d.value * s.factor)}`,
        );
        svg
          .append("circle")
          .attr("cx", 58 + index * 100)
          .attr("cy", 10)
          .attr("r", 4)
          .attr("fill", s.color);
        svg
          .append("text")
          .attr("x", 68 + index * 100)
          .attr("y", 14)
          .attr("font-size", 12)
          .text(s.label);
      });
    }
    svg.selectAll(".tick text").attr("fill", "#566078").attr("font-size", 11);
  }, [widget, days, uid]);
  return (
    <svg
      ref={ref}
      role="img"
      aria-label={`${widget?.title} — demo data for ${days} days`}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        fontFamily: "inherit",
        color: "#151b2d",
        fontSize: 14,
      }}
    />
  );
}
