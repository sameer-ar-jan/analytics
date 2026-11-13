"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { select } from "d3";
import { buildSourceInsights, SOURCE_METRICS } from "./source-insights";
import { drawSourceInsight } from "./draw-source-insight";
import styles from "./dashboard.module.css";

const DEFAULT_METRIC = {
  "cpi-trend": "cpi", "roas-trend": "r7", "retention-trend": "ret7",
  "installs-trend": "installs", ranking: "r7", box: "cpi", distribution: "cpi",
};
const FIXED_METRIC = new Set(["cpi-trend", "installs-trend", "bubble", "cpi-retention", "cpi-roas", "retention-roas", "dumbbell", "slope", "correlation", "radar"]);
export default function SourceInsight({ widget, rows, period }) {
  const [metric, setMetric] = useState(DEFAULT_METRIC[widget.view] || "spend");
  const [source, setSource] = useState("all");
  const [target, setTarget] = useState("");
  const ref = useRef(null);
  const model = useMemo(() => buildSourceInsights(rows, period), [rows, period]);
  const options = Object.entries(SOURCE_METRICS).filter(([key]) => {
    if (["share", "pareto", "waterfall"].includes(widget.view)) return ["spend", "installs"].includes(key);
    if (widget.view === "roas-trend") return ["r0", "r7"].includes(key);
    if (widget.view === "retention-trend") return ["ret1", "ret7"].includes(key);
    return true;
  });
  useEffect(() => {
    const svg = select(ref.current);
    drawSourceInsight(svg, model, widget.view, metric, source, Number(target));
    return () => svg.selectAll("*").remove();
  }, [model, widget.view, metric, source, target]);

  return (
    <div className={styles.sourceInsight}>
      <div className={styles.insightControls}>
        {!FIXED_METRIC.has(widget.view) && <label>Metric
          <select aria-label={`${widget.title} metric`} value={metric} onChange={(event) => { setMetric(event.target.value); setTarget(""); }}>
            {options.map(([key, name]) => <option key={key} value={key}>{name}</option>)}
          </select>
        </label>}
        <label>Media source
          <select aria-label={`${widget.title} media source`} value={source} onChange={(event) => setSource(event.target.value)}>
            <option value="all">All sources</option>
            {model.totals.map((s) => <option key={s.category} value={s.category}>{s.name}</option>)}
          </select>
        </label>
        {widget.view === "target" && <label>Target ({SOURCE_METRICS[metric]})
          <input aria-label="Source metric target" type="number" min="0" step="any" value={target} placeholder="Enter goal" onChange={(event) => setTarget(event.target.value)} />
        </label>}
      </div>
      <div className={styles.insightPlot}>
        <svg ref={ref} role="img" aria-label={widget.title} />
      </div>
      <p className={styles.insightNote}>
        ROAS uses spend weights; retention uses install weights. Rates keep the table’s units.
        Missing values are excluded; unweighted means are used when weights are unavailable.
        {widget.view === "waterfall" && " Compares the selected dates with the immediately preceding equal-length period; absent source spend/installs count as zero."}
        {widget.view === "correlation" && " Correlation uses source-day pairs and does not establish causation."}
        {widget.view === "target" && " CPI goals are ceilings; other goals are minimums. Targets apply per source."}
      </p>
    </div>
  );
}
