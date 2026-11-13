"use client";

import React, { useMemo, useState } from "react";
import LineChart from "../Charts/LineChart";
import { getReportDay } from "../Charts/chartDates";
import D3Chart from "./D3Chart";
import {
  buildDailySeries,
  buildSourceTotals,
  buildSourceEfficiency,
  filterDashboardRows,
  getMetricTotal,
  getSourceMetric,
  MEDIA_SOURCES,
} from "./dashboard-data";
import styles from "./dashboard.module.css";

const METRIC_WIDGETS = {
  users: { label: "New Users", color: "#247cff", icon: "↗", currency: false },
  dau: {
    label: "Daily Active Users",
    color: "#13bc7e",
    icon: "◉",
    currency: false,
  },
  revenue: { label: "Ad Revenue", color: "#8d4df5", icon: "$", currency: true },
  iap: {
    label: "In-App Purchases",
    color: "#f09428",
    icon: "▤",
    currency: true,
  },
  spend: {
    label: "Total Media Spend",
    color: "#e45c73",
    icon: "↗",
    currency: true,
  },
};

const formatValue = (value, currency = false) => {
  const formatted = Number(value || 0).toLocaleString("en-US", {
    maximumFractionDigits: currency ? 2 : 0,
  });
  return currency ? `$${formatted}` : formatted;
};

function MetricWidget({ widget, rows, days, periodLabel }) {
  const definition = METRIC_WIDGETS[widget.metric];
  const periodRows = useMemo(
    () => filterDashboardRows(rows, days),
    [rows, days],
  );
  const value = getMetricTotal(periodRows, widget.metric);

  return (
    <div
      className={styles.metricWidget}
      style={{ "--accent": definition.color }}
    >
      <span className={styles.metricIcon} aria-hidden="true">
        {definition.icon}
      </span>
      <div>
        <p>{definition.label}</p>
        <strong>{formatValue(value, definition.currency)}</strong>
        <small>{periodLabel || `Selected ${days}-day period`}</small>
      </div>
    </div>
  );
}

function MediaSourcesTable({ rows, days, periodLabel }) {
  const [sourceFilter, setSourceFilter] = useState("all");
  const [search, setSearch] = useState("");
  const visibleSources = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return MEDIA_SOURCES.filter(
      (source) => sourceFilter === "all" || source.label === sourceFilter,
    ).filter(
      (source) =>
        !normalizedSearch ||
        `${source.name} ${source.label}`
          .toLowerCase()
          .includes(normalizedSearch),
    );
  }, [sourceFilter, search]);
  const visibleRows = useMemo(
    () =>
      filterDashboardRows(rows, days)
        .map((row, index) => ({
          row,
          index,
          timestamp: getReportDay(row?.Install_time),
        }))
        .sort(
          (first, second) => (second.timestamp ?? 0) - (first.timestamp ?? 0),
        ),
    [rows, days],
  );

  const columns = [
    {
      key: "spend",
      label: "spend",
      field: (source) => `${source.prefix}_cost`,
      integer: true,
    },
    {
      key: "users",
      label: "users",
      field: (source) => `${source.prefix}_users`,
      integer: true,
    },
    {
      key: "cpi",
      label: "cpi",
      field: (source) => `${source.prefix}_cpi`,
      decimals: 2,
    },
    { key: "r0", label: "RO_D0", field: (source) => source.r0, integer: true },
    { key: "r7", label: "RO_D7", field: (source) => source.r7, integer: true },
    {
      key: "ret1",
      label: "Ret_D1",
      field: (source) => source.ret1,
      integer: true,
    },
    {
      key: "ret7",
      label: "Ret_D7",
      field: (source) => source.ret7,
      integer: true,
    },
  ];

  const renderMetric = (row, source, column) => {
    const raw = column.field(source);
    const value =
      typeof raw === "string" || Array.isArray(raw)
        ? getSourceMetric(row, raw)
        : Number(row?.[raw]);
    if (!Number.isFinite(value)) return "0";
    return column.decimals
      ? value.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : Math.round(value).toLocaleString("en-US");
  };

  return (
    <div className={styles.tableWidget}>
      <div className={styles.tableToolbar}>
        <div className={styles.tableHeading}>
          <strong>Media source performance</strong>
          <span>Spend, acquisition, ROAS, and retention</span>
        </div>
        <div className={styles.tableFilters}>
          <label className={styles.sourceFilter}>
            <span>Media source</span>
            <select
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value)}
            >
              <option value="all">All sources</option>
              {MEDIA_SOURCES.map((source) => (
                <option key={source.label} value={source.label}>
                  {source.label} · {source.name}
                </option>
              ))}
            </select>
          </label>
          <label className={`${styles.searchFilter} ${styles.searchLabel}`}>
            <span className={styles.visuallyHidden}>Search media sources</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search media sources"
              aria-label="Search media sources"
            />
          </label>
        </div>
      </div>
      <div className={styles.tableScroll}>
        <table className={styles.sourceTable}>
          <caption className={styles.visuallyHidden}>
            Media-source daily spend, users, CPI, ROAS and retention for the
            selected date range.
          </caption>
          <thead>
            <tr>
              <th className={styles.dateHeader} scope="col" rowSpan={2}>
                <span>Date</span>
                <small>Daily</small>
              </th>
              {visibleSources.map((source) => (
                <th
                  className={styles.sourceGroupHeader}
                  key={source.label}
                  scope="colgroup"
                  colSpan={columns.length}
                  title={source.name}
                >
                  <span className={styles.sourceIndicator} aria-hidden="true">
                    {source.label.slice(0, 1)}
                  </span>
                  <span>{source.name}</span>
                  <small>{source.label}</small>
                </th>
              ))}
            </tr>
            <tr>
              {visibleSources.flatMap((source) =>
                columns.map((column, index) => (
                  <th
                    className={`${styles.metricHeader} ${index === columns.length - 1 ? styles.sourceEnd : ""}`}
                    key={`${source.label}-${column.key}`}
                    scope="col"
                  >
                    {column.label}
                  </th>
                )),
              )}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map(({ row, index, timestamp }) => (
              <tr
                key={`${row.game || "overall"}-${timestamp || "undated"}-${index}`}
              >
                <th className={styles.dateCell} scope="row">
                  {timestamp == null
                    ? "—"
                    : new Date(timestamp).toLocaleDateString("en-US")}
                </th>
                {visibleSources.flatMap((source) =>
                  columns.map((column, columnIndex) => (
                    <td
                      className={`${styles.sourceMetricCell} ${columnIndex === columns.length - 1 ? styles.sourceEnd : ""}`}
                      key={`${source.label}-${column.key}`}
                    >
                      {renderMetric(row, source, column)}
                    </td>
                  )),
                )}
              </tr>
            ))}
            {(!visibleSources.length || !visibleRows.length) && (
              <tr>
                <td
                  className={styles.noTableData}
                  colSpan={1 + visibleSources.length * columns.length}
                >
                  No report rows match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className={styles.tableFooter}>
        <span>
          Showing <strong>{visibleRows.length.toLocaleString("en-US")}</strong>{" "}
          daily rows
        </span>
        <span>
          <strong>{visibleSources.length}</strong> media sources <i /> {periodLabel || `Last ${days} days`}
        </span>
      </div>
    </div>
  );
}

export default function WidgetRenderer({
  widget,
  rows = [],
  days = 30,
  dateRange,
  periodLabel,
  loading = false,
}) {
  const period = dateRange || days;
  const chartData = useMemo(() => {
    if (widget?.kind !== "chart") return [];
    if (widget.metric === "source-efficiency")
      return buildSourceEfficiency(rows, period);
    if (widget.metric === "source-total-spend")
      return buildSourceTotals(rows, period, "spend");
    return buildDailySeries(rows, widget.metric, period);
  }, [widget, rows, period]);
  const end = dateRange?.end || new Date();
  const start = dateRange?.start || new Date(
    end.getFullYear(),
    end.getMonth(),
    end.getDate() - days + 1,
  );

  if (!widget) return null;
  if (loading)
    return (
      <p className={styles.widgetStatus} role="status">
        Loading report data…
      </p>
    );
  if (widget.kind === "metric") {
    return <MetricWidget widget={widget} rows={rows} days={period} periodLabel={periodLabel} />;
  }
  if (widget.kind === "table") {
    return <MediaSourcesTable rows={rows} days={period} periodLabel={periodLabel} />;
  }
  if (!chartData.length) {
    return (
      <p className={styles.widgetStatus}>No data available for this period.</p>
    );
  }

  return (
    <div className={styles.chartWidget}>
      {widget.engine === "d3" ? (
        <D3Chart
          data={chartData}
          chartType={widget.chartType}
          title={widget.title}
          goal={widget.goal}
        />
      ) : (
        <LineChart data={chartData} xAxisRange={{ start, end }} />
      )}
    </div>
  );
}
