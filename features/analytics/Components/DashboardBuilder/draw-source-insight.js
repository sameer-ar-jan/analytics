import * as d3 from "d3";
import { SOURCE_METRICS, pearson } from "./source-insights.js";

const W = 800, H = 410, L = 88, R = 730, T = 40, B = 325;
const palette = d3.schemeTableau10;
const fmt = (v) => Number.isFinite(v) ? d3.format(",.2~f")(v) : "No data";
const label = (svg, x, y, text, anchor = "start", size = 11) => svg.append("text").attr("x", x).attr("y", y).attr("text-anchor", anchor).attr("font-size", size).attr("fill", "#475569").text(text);
const tip = (selection, text) => selection.append("title").text(text);
const linear = (values, range, zero = true) => {
  let [min, max] = d3.extent(values.filter(Number.isFinite));
  if (min == null) { min = 0; max = 1; }
  if (zero) { min = Math.min(0, min); max = Math.max(0, max); }
  if (min === max) { min -= 0.5; max += 0.5; }
  return d3.scaleLinear().domain([min, max]).nice().range(range);
};
function axes(svg, x, y, xTitle, yTitle) {
  svg.append("g").attr("transform", `translate(0,${B})`).call(d3.axisBottom(x).ticks(6));
  svg.append("g").attr("transform", `translate(${L},0)`).call(d3.axisLeft(y).ticks(5));
  if (xTitle) label(svg, (L + R) / 2, B + 43, xTitle, "middle");
  if (yTitle) label(svg, L, 20, yTitle);
}
function legend(svg, categories, color) {
  categories.forEach((name, i) => {
    const x = 20 + (i % 6) * 130, y = 380 + Math.floor(i / 6) * 18;
    svg.append("circle").attr("cx", x).attr("cy", y - 3).attr("r", 4).attr("fill", color(name));
    label(svg, x + 9, y, name);
  });
}
export function drawSourceInsight(svg, model, view, metric, source, target) {
  svg.selectAll("*").remove();
  svg.attr("viewBox", `0 0 ${W} ${H}`).attr("font-family", "system-ui");
  const totals = model.totals.filter((s) => source === "all" || s.category === source);
  const daily = model.daily.filter((s) => source === "all" || s.category === source);
  const names = totals.map((s) => s.category);
  const color = d3.scaleOrdinal(names, palette);
  const usable = totals.filter((s) => Number.isFinite(s[metric]));
  const empty = (message = "No reported values for these filters.") => label(svg, W / 2, H / 2, message, "middle", 14);
  if (!totals.length && !(view === "waterfall" && model.hasPrevious)) { empty(); return; }

  if (["cpi-trend", "roas-trend", "retention-trend", "installs-trend", "share"].includes(view)) {
    const key = view === "cpi-trend" ? "cpi" : view === "installs-trend" ? "installs" : view === "roas-trend" ? (metric === "r0" ? "r0" : "r7") : view === "retention-trend" ? (metric === "ret1" ? "ret1" : "ret7") : metric;
    const points = daily.filter((s) => Number.isFinite(s[key]));
    if (!points.length) { empty(); return; }
    const dates = [...new Set(points.map((s) => +s.date))].sort((a, b) => a - b);
    const domain = dates.length === 1 ? [dates[0] - 43200000, dates[0] + 43200000] : d3.extent(dates);
    const x = d3.scaleTime().domain(domain).range([L, R]);
    if (view === "share") {
      const table = dates.map((date) => Object.fromEntries([["date", date], ...names.map((name) => [name, points.find((p) => +p.date === date && p.category === name)?.[key] ?? 0])]));
      const layers = d3.stack().keys(names).offset(d3.stackOffsetExpand)(table);
      const y = d3.scaleLinear().domain([0, 1]).range([B, T]);
      axes(svg, x, y, "Date", "Share (0–1)");
      if (dates.length === 1) {
        for (const layer of layers) tip(svg.append("rect").attr("x", (L + R) / 2 - 35).attr("y", y(layer[0][1])).attr("width", 70).attr("height", Math.max(0, y(layer[0][0]) - y(layer[0][1]))).attr("fill", color(layer.key)), `${layer.key}: ${fmt((layer[0][1] - layer[0][0]) * 100)}%`);
      }
      svg.selectAll(".share").data(layers).join("path").attr("fill", (d) => color(d.key)).attr("d", d3.area().x((d) => x(d.data.date)).y0((d) => y(d[0])).y1((d) => y(d[1]))).each(function (d) { tip(d3.select(this), `${d.key}: ${table.map((row, i) => `${d3.timeFormat("%Y-%m-%d")(new Date(row.date))} ${fmt((d[i][1] - d[i][0]) * 100)}%`).join("; ")}`); });
    } else {
      const y = linear(points.map((p) => p[key]), [B, T]); axes(svg, x, y, "Date", SOURCE_METRICS[key]);
      for (const [name, group] of d3.group(points, (p) => p.category)) {
        svg.append("path").datum(group).attr("fill", "none").attr("stroke", color(name)).attr("stroke-width", 2).attr("d", d3.line().x((p) => x(p.date)).y((p) => y(p[key])));
        tip(svg.append("g").selectAll("circle").data(group).join("circle").attr("cx", (p) => x(p.date)).attr("cy", (p) => y(p[key])).attr("r", 3).attr("fill", color(name)), (p) => `${name} · ${d3.timeFormat("%Y-%m-%d")(p.date)}: ${fmt(p[key])}`);
      }
    }
    legend(svg, names, color); return;
  }
  if (["bubble", "cpi-retention", "cpi-roas", "retention-roas"].includes(view)) {
    const xKey = view === "bubble" ? "spend" : view === "retention-roas" ? "ret7" : "cpi";
    const yKey = view === "cpi-retention" ? "ret7" : "r7";
    const points = totals.filter((p) => Number.isFinite(p[xKey]) && Number.isFinite(p[yKey]) && (view !== "bubble" || p.installs !== null));
    if (!points.length) { empty(); return; }
    const x = linear(points.map((p) => p[xKey]), [L, R]), y = linear(points.map((p) => p[yKey]), [B, T]);
    const radius = d3.scaleSqrt().domain([0, d3.max(points, (p) => p.installs) || 1]).range([3, 27]);
    axes(svg, x, y, SOURCE_METRICS[xKey], SOURCE_METRICS[yKey]);
    tip(svg.selectAll("circle").data(points).join("circle").attr("cx", (p) => x(p[xKey])).attr("cy", (p) => y(p[yKey])).attr("r", (p) => view === "bubble" ? radius(Math.max(0, p.installs)) : 6).attr("fill", (p) => color(p.category)).attr("opacity", 0.7), (p) => `${p.name}: ${SOURCE_METRICS[xKey]} ${fmt(p[xKey])}, ${SOURCE_METRICS[yKey]} ${fmt(p[yKey])}, installs ${fmt(p.installs)}`);
    legend(svg, names, color); if (view === "bubble") label(svg, R, 20, "Bubble area = installs", "end"); return;
  }
  if (["dumbbell", "slope"].includes(view)) {
    const first = view === "dumbbell" ? "r0" : "ret1", second = view === "dumbbell" ? "r7" : "ret7";
    const points = totals.filter((p) => p[first] !== null && p[second] !== null);
    if (!points.length) { empty(); return; }
    if (view === "dumbbell") {
      const x = linear(points.flatMap((p) => [p[first], p[second]]), [L, R]);
      const y = d3.scalePoint().domain(points.map((p) => p.category)).range([T + 10, B - 10]); axes(svg, x, y, "ROAS · open D0 / filled D7", "Source");
      for (const p of points) {
        tip(svg.append("line").attr("x1", x(p[first])).attr("x2", x(p[second])).attr("y1", y(p.category)).attr("y2", y(p.category)).attr("stroke", color(p.category)).attr("stroke-width", 3), `${p.category}: D0 ${fmt(p[first])} → D7 ${fmt(p[second])}`);
        for (const key of [first, second]) svg.append("circle").attr("cx", x(p[key])).attr("cy", y(p.category)).attr("r", 5).attr("stroke", color(p.category)).attr("fill", key === first ? "white" : color(p.category));
      }
    } else {
      const y = linear(points.flatMap((p) => [p[first], p[second]]), [B, T]);
      const x = d3.scalePoint().domain(["D1", "D7"]).range([L + 80, R - 80]); axes(svg, x, y, "Retention checkpoint", "Reported retention");
      points.forEach((p) => {
        tip(svg.append("line").attr("x1", x("D1")).attr("x2", x("D7")).attr("y1", y(p[first])).attr("y2", y(p[second])).attr("stroke", color(p.category)).attr("stroke-width", 2), `${p.name}: D1 ${fmt(p[first])} → D7 ${fmt(p[second])}`);
        label(svg, x("D7") + 8, y(p[second]), `${p.category} ${fmt(p[second])}`);
      });
    }
    legend(svg, names, color); return;
  }
  if (view === "correlation") {
    const keys = Object.keys(SOURCE_METRICS), size = 37, left = 230;
    keys.forEach((key, i) => { label(svg, left - 8, T + i * size + 23, SOURCE_METRICS[key], "end"); label(svg, left + i * size + size / 2, T - 8, SOURCE_METRICS[key], "middle", 9); });
    for (let i = 0; i < keys.length; i++) for (let j = 0; j < keys.length; j++) {
      const r = pearson(daily, keys[i], keys[j]);
      tip(svg.append("rect").attr("x", left + j * size).attr("y", T + i * size).attr("width", size - 1).attr("height", size - 1).attr("fill", r === null ? "#e2e8f0" : d3.interpolateRdBu((r + 1) / 2)), `${SOURCE_METRICS[keys[i]]} vs ${SOURCE_METRICS[keys[j]]}: ${r === null ? "Insufficient variation or fewer than 3 observations" : r.toFixed(3)}`);
      label(svg, left + j * size + size / 2, T + i * size + 23, r === null ? "—" : r.toFixed(2), "middle");
    }
    label(svg, 400, 340, "Source-day observations · red −1 / white 0 / blue +1", "middle"); return;
  }
  if (view === "radar") {
    const keys = Object.keys(SOURCE_METRICS), cx = 360, cy = 190, radius = 125;
    const angle = (i) => i * Math.PI * 2 / keys.length - Math.PI / 2;
    const xy = (i, r) => [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r];
    const ranges = Object.fromEntries(keys.map((key) => [key, linear(model.totals.map((p) => p[key]), [0, 1])]));
    for (const fraction of [0.25, 0.5, 0.75, 1]) svg.append("polygon").attr("points", keys.map((_, i) => xy(i, radius * fraction).join(",")).join(" ")).attr("fill", "none").attr("stroke", "#dbe3ee");
    keys.forEach((key, i) => { const [x, y] = xy(i, radius + 24); label(svg, x, y, SOURCE_METRICS[key], "middle"); });
    const complete = totals.filter((p) => keys.every((key) => p[key] !== null));
    if (!complete.length) { empty("Radar needs all seven metrics for at least one source."); return; }
    for (const p of complete) tip(svg.append("polygon").attr("points", keys.map((key, i) => xy(i, radius * ranges[key](p[key])).join(",")).join(" ")).attr("fill", color(p.category)).attr("fill-opacity", 0.08).attr("stroke", color(p.category)).attr("stroke-width", 2), `${p.name}: ${keys.map((key) => `${SOURCE_METRICS[key]} ${fmt(p[key])}`).join(", ")}`);
    label(svg, 400, 350, "Normalized to metric maxima · larger CPI/spend is not necessarily better", "middle"); legend(svg, complete.map((p) => p.category), color); return;
  }
  if (view === "box") {
    const groups = [...d3.group(daily.filter((p) => p[metric] !== null), (p) => p.category)].map(([category, rows]) => {
      const values = rows.map((p) => p[metric]).sort(d3.ascending);
      return { category, min: values[0], max: values.at(-1), q1: d3.quantile(values, 0.25), median: d3.quantile(values, 0.5), q3: d3.quantile(values, 0.75), n: values.length };
    });
    if (!groups.length) { empty(); return; }
    const x = d3.scaleBand().domain(groups.map((p) => p.category)).range([L, R]).padding(0.4), y = linear(groups.flatMap((p) => [p.min, p.max]), [B, T]); axes(svg, x, y, "Source", SOURCE_METRICS[metric]);
    for (const p of groups) {
      const center = x(p.category) + x.bandwidth() / 2;
      svg.append("line").attr("x1", center).attr("x2", center).attr("y1", y(p.min)).attr("y2", y(p.max)).attr("stroke", color(p.category));
      tip(svg.append("rect").attr("x", x(p.category)).attr("y", y(p.q3)).attr("width", x.bandwidth()).attr("height", Math.max(1, y(p.q1) - y(p.q3))).attr("fill", color(p.category)).attr("opacity", 0.6), `${p.category}: n=${p.n}, min ${fmt(p.min)}, Q1 ${fmt(p.q1)}, median ${fmt(p.median)}, Q3 ${fmt(p.q3)}, max ${fmt(p.max)}`);
      svg.append("line").attr("x1", x(p.category)).attr("x2", x(p.category) + x.bandwidth()).attr("y1", y(p.median)).attr("y2", y(p.median)).attr("stroke", "#111827");
    }
    label(svg, 400, 375, "Boxes: 25th–75th percentiles · line: median · whiskers: min/max", "middle"); return;
  }
  if (view === "distribution") {
    const values = daily.map((p) => p[metric]).filter(Number.isFinite);
    if (!values.length) { empty(); return; }
    const x = linear(values, [L, R], false), bins = d3.bin().domain(x.domain()).thresholds(14)(values), y = linear(bins.map((b) => b.length), [B, T]); axes(svg, x, y, SOURCE_METRICS[metric], "Source-day count");
    tip(svg.selectAll("rect").data(bins).join("rect").attr("x", (b) => x(b.x0) + 1).attr("y", (b) => y(b.length)).attr("width", (b) => Math.max(0, x(b.x1) - x(b.x0) - 2)).attr("height", (b) => B - y(b.length)).attr("fill", palette[0]), (b) => `${fmt(b.x0)}–${fmt(b.x1)}: ${b.length} observations`); return;
  }
  if (view === "calendar") {
    const groups = [...d3.group(daily, (p) => +p.date)].map(([date, group]) => {
      // Daily totals use the same weights as period summaries.
      const present = group.filter((p) => p[metric] !== null);
      const additive = ["spend", "installs"].includes(metric);
      const weightKey = metric.startsWith("ret") ? "installs" : "spend";
      const weight = d3.sum(present, (p) => p[weightKey] || 0);
      const value = !present.length ? null : additive ? d3.sum(present, (p) => p[metric]) : metric === "cpi" ? (d3.sum(present, (p) => p.installs) > 0 ? d3.sum(present, (p) => p.spend) / d3.sum(present, (p) => p.installs) : d3.mean(present, (p) => p.cpi)) : weight > 0 ? d3.sum(present, (p) => p[metric] * (p[weightKey] || 0)) / weight : d3.mean(present, (p) => p[metric]);
      return { date: new Date(date), value };
    }).filter((p) => p.value !== null);
    if (!groups.length) { empty(); return; }
    const first = d3.timeMonday.floor(model.start), weeks = Math.max(1, d3.timeMonday.count(first, model.end) + 1), cell = Math.min(32, (R - L) / weeks);
    const scale = d3.scaleSequential(d3.interpolateBlues).domain([0, d3.max(groups, (p) => p.value) || 1]);
    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach((day, i) => label(svg, L - 10, T + i * 34 + 22, day, "end"));
    tip(svg.selectAll("rect").data(groups).join("rect").attr("x", (p) => L + d3.timeMonday.count(first, p.date) * cell).attr("y", (p) => T + ((p.date.getDay() + 6) % 7) * 34).attr("width", Math.max(1, cell - 2)).attr("height", 31).attr("rx", 2).attr("fill", (p) => scale(p.value)), (p) => `${d3.timeFormat("%Y-%m-%d")(p.date)}: ${SOURCE_METRICS[metric]} ${fmt(p.value)}`);
    label(svg, L, 315, d3.timeFormat("%d %b %Y")(model.start)); label(svg, R, 315, d3.timeFormat("%d %b %Y")(model.end), "end"); label(svg, L, 350, `${SOURCE_METRICS[metric]} · light = low / dark = high · gaps = no reported data`); return;
  }
  if (view === "waterfall") {
    if (!model.hasPrevious) { empty("No data for the preceding equal-length period."); return; }
    const before = model.previous.filter((s) => source === "all" || s.category === source);
    const allNames = [...new Set([...names, ...before.map((p) => p.category)])];
    let running = d3.sum(before, (p) => p[metric]);
    const bars = [{ category: "Previous", from: 0, to: running, total: true }];
    for (const name of allNames) {
      const delta = (totals.find((p) => p.category === name)?.[metric] ?? 0) - (before.find((p) => p.category === name)?.[metric] ?? 0);
      bars.push({ category: name, from: running, to: running + delta }); running += delta;
    }
    bars.push({ category: "Current", from: 0, to: running, total: true });
    const x = d3.scaleBand().domain(bars.map((p) => p.category)).range([L, R]).padding(0.2), y = linear(bars.flatMap((p) => [p.from, p.to]), [B, T]); axes(svg, x, y, "Previous period → source changes → current period", SOURCE_METRICS[metric]);
    tip(svg.selectAll("rect").data(bars).join("rect").attr("x", (p) => x(p.category)).attr("y", (p) => y(Math.max(p.from, p.to))).attr("width", x.bandwidth()).attr("height", (p) => Math.max(1, Math.abs(y(p.from) - y(p.to)))).attr("fill", (p) => p.total ? palette[0] : p.to >= p.from ? "#16a58c" : "#df5f6b"), (p) => `${p.category}: ${fmt(p.total ? p.to : p.to - p.from)}`);
    for (let i = 0; i < bars.length - 1; i++) svg.append("line").attr("x1", x(bars[i].category) + x.bandwidth()).attr("x2", x(bars[i + 1].category)).attr("y1", y(bars[i].to)).attr("y2", y(bars[i].to)).attr("stroke", "#94a3b8").attr("stroke-dasharray", "3 3"); return;
  }
  if (!usable.length) { empty(); return; }
  const sorted = [...usable].sort((a, b) => metric === "cpi" ? a[metric] - b[metric] : b[metric] - a[metric]);
  if (view === "pareto") {
    sorted.sort((a, b) => b[metric] - a[metric]);
    const total = d3.sum(sorted, (p) => p[metric]); if (total <= 0) { empty(); return; }
    const x = d3.scaleBand().domain(sorted.map((p) => p.category)).range([L, R]).padding(0.2), y = linear(sorted.map((p) => p[metric]), [B, T]), percent = d3.scaleLinear().domain([0, 100]).range([B, T]); axes(svg, x, y, "Sources · descending contribution", SOURCE_METRICS[metric]);
    tip(svg.selectAll("rect").data(sorted).join("rect").attr("x", (p) => x(p.category)).attr("y", (p) => y(p[metric])).attr("width", x.bandwidth()).attr("height", (p) => y(0) - y(p[metric])).attr("fill", (p) => color(p.category)), (p) => `${p.category}: ${fmt(p[metric])}`);
    let cumulative = 0; const points = sorted.map((p) => ({ ...p, percent: (cumulative += p[metric]) / total * 100 }));
    svg.append("path").datum(points).attr("d", d3.line().x((p) => x(p.category) + x.bandwidth() / 2).y((p) => percent(p.percent))).attr("fill", "none").attr("stroke", "#111827").attr("stroke-width", 2);
    tip(svg.selectAll(".pareto-point").data(points).join("circle").attr("cx", (p) => x(p.category) + x.bandwidth() / 2).attr("cy", (p) => percent(p.percent)).attr("r", 4), (p) => `${p.category}: cumulative ${fmt(p.percent)}%`);
    svg.append("g").attr("transform", `translate(${R},0)`).call(d3.axisRight(percent).ticks(5).tickFormat((v) => `${v}%`)); return;
  }
  // Rankings and bullet charts share source rows; bullet targets are supplied by the user.
  const x = linear([...sorted.map((p) => p[metric]), view === "target" ? target : 0], [L, R]);
  const y = d3.scaleBand().domain(sorted.map((p) => p.category)).range([T, B]).padding(0.25);
  axes(svg, x, y, SOURCE_METRICS[metric], "Source");
  if (view === "target" && !(target > 0)) { empty("Enter a positive target above to compare sources."); return; }
  if (view === "target") svg.selectAll(".track").data(sorted).join("rect").attr("x", x(0)).attr("y", (p) => y(p.category)).attr("width", R - x(0)).attr("height", y.bandwidth()).attr("fill", "#e2e8f0");
  tip(svg.selectAll(".bar").data(sorted).join("rect").attr("x", (p) => Math.min(x(0), x(p[metric]))).attr("y", (p) => y(p.category) + (view === "target" ? y.bandwidth() * 0.2 : 0)).attr("width", (p) => Math.abs(x(p[metric]) - x(0))).attr("height", y.bandwidth() * (view === "target" ? 0.6 : 1)).attr("fill", (p) => view === "target" ? ((metric === "cpi" ? p[metric] <= target : p[metric] >= target) ? "#16a58c" : "#e69a27") : color(p.category)), (p) => `${p.name}: ${fmt(p[metric])}${view === "target" ? ` / target ${fmt(target)}` : ""}`);
  if (view === "target") svg.selectAll(".target").data(sorted).join("line").attr("x1", x(target)).attr("x2", x(target)).attr("y1", (p) => y(p.category) - 2).attr("y2", (p) => y(p.category) + y.bandwidth() + 2).attr("stroke", "#111827").attr("stroke-width", 2);
}
