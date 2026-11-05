"use client";

import React, { useMemo, useState } from "react";
import LineChart from "../Charts/LineChart";
import {
  aggregateMediaSources,
  buildDailySeries,
  filterDashboardRows,
  getMetricTotal,
  MEDIA_SOURCES,
} from "./dashboard-data";
import styles from "./dashboard.module.css";

const METRIC_WIDGETS = {
  users: { label: "New Users", color: "#247cff", icon: "↗", currency: false },
  dau: { label: "Daily Active Users", color: "#13bc7e", icon: "◉", currency: false },
  revenue: { label: "Ad Revenue", color: "#8d4df5", icon: "$", currency: true },
  iap: { label: "In-App Purchases", color: "#f09428", icon: "▤", currency: true },
  spend: { label: "Total Media Spend", color: "#e45c73", icon: "↗", currency: true },
};

const formatValue = (value, currency = false) => {
  const formatted = Number(value || 0).toLocaleString("en-US", {
    maximumFractionDigits: currency ? 2 : 0,
  });
  return currency ? `$${formatted}` : formatted;
};

function MetricWidget({ widget, rows, days }) {
  const definition = METRIC_WIDGETS[widget.metric];
  const periodRows = useMemo(() => filterDashboardRows(rows, days), [rows, days]);
  const value = getMetricTotal(periodRows, widget.metric);

  return (
    <div className={styles.metricWidget} style={{ "--accent": definition.color }}>
      <span className={styles.metricIcon} aria-hidden="true">{definition.icon}</span>
      <div>
        <p>{definition.label}</p>
        <strong>{formatValue(value, definition.currency)}</strong>
        <small>Selected {days}-day period</small>
      </div>
    </div>
  );
}

function MediaSourcesTable({ rows, days }) {
  const [sourceFilter, setSourceFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: "spend", direction: "desc" });
  const sources = useMemo(() => aggregateMediaSources(rows, days), [rows, days]);
  const visibleSources = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return sources
      .filter((source) => sourceFilter === "all" || source.label === sourceFilter)
      .filter((source) => !normalizedSearch || `${source.name} ${source.label}`.toLowerCase().includes(normalizedSearch))
      .sort((first, second) => {
        const multiplier = sort.direction === "asc" ? 1 : -1;
        const a = first[sort.key];
        const b = second[sort.key];
        return typeof a === "number" && typeof b === "number"
          ? (a - b) * multiplier
          : String(a).localeCompare(String(b)) * multiplier;
      });
  }, [sources, sourceFilter, search, sort]);

  const changeSort = (key) => {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === "desc" ? "asc" : "desc",
    }));
  };

  return (
    <div className={styles.tableWidget}>
      <div className={styles.tableFilters}>
        <label>
          <span>Media source</span>
          <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)}>
            <option value="all">All sources</option>
            {MEDIA_SOURCES.map((source) => (
              <option key={source.label} value={source.label}>{source.name}</option>
            ))}
          </select>
        </label>
        <label className={styles.searchFilter}>
          <span>Search sources</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name"
          />
        </label>
      </div>
      <div className={styles.tableScroll}>
        <table className={styles.sourceTable}>
          <thead>
            <tr>
              <th scope="col"><button onClick={() => changeSort("name")}>Media source</button></th>
              <th scope="col"><button onClick={() => changeSort("installs")}>Installs</button></th>
              <th scope="col"><button onClick={() => changeSort("spend")}>Spend</button></th>
              <th scope="col"><button onClick={() => changeSort("cpi")}>CPI</button></th>
            </tr>
          </thead>
          <tbody>
            {visibleSources.map((source) => (
              <tr key={source.label}>
                <th scope="row"><span className={styles.sourceBadge}>{source.label}</span>{source.name}</th>
                <td>{formatValue(source.installs)}</td>
                <td>{formatValue(source.spend, true)}</td>
                <td>{formatValue(source.cpi, true)}</td>
              </tr>
            ))}
            {!visibleSources.length && (
              <tr><td className={styles.noTableData} colSpan={4}>No media-source rows match the current filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <small className={styles.tableCaption}>{visibleSources.length} sources · aggregated from the selected report rows</small>
    </div>
  );
}

export default function WidgetRenderer({ widget, rows = [], days = 30, loading = false }) {
  const chartData = useMemo(
    () => widget?.kind === "chart" ? buildDailySeries(rows, widget.metric, days) : [],
    [widget, rows, days],
  );
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - days + 1);

  if (!widget) return null;
  if (loading) return <p className={styles.widgetStatus} role="status">Loading report data…</p>;
  if (widget.kind === "metric") {
    return <MetricWidget widget={widget} rows={rows} days={days} />;
  }
  if (widget.kind === "table") {
    return <MediaSourcesTable rows={rows} days={days} />;
  }
  if (!chartData.length) {
    return <p className={styles.widgetStatus}>No data available for this period.</p>;
  }

  return (
    <div className={styles.chartWidget}>
      <LineChart data={chartData} xAxisRange={{ start, end }} />
    </div>
  );
}
