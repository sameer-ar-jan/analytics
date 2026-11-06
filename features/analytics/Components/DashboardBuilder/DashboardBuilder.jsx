"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import ReactGridLayout, {
  useContainerWidth,
  verticalCompactor,
} from "react-grid-layout";
import WidgetRenderer from "./WidgetRenderer";
import WidgetPopup from "./WidgetPopup";
import { DASHBOARD_GAMES } from "./dashboard-data";
import styles from "./dashboard.module.css";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const STORAGE_KEY = "analytics-dashboard-layout-v3";
const WIDGET_DEFINITIONS = [
  { type: "metric-users", title: "New Users", kind: "metric", metric: "users" },
  { type: "metric-dau", title: "Daily Active Users", kind: "metric", metric: "dau" },
  { type: "metric-revenue", title: "Ad Revenue", kind: "metric", metric: "revenue" },
  { type: "metric-iap", title: "In-App Purchases", kind: "metric", metric: "iap" },
  { type: "metric-spend", title: "Total Media Spend", kind: "metric", metric: "spend" },
  { type: "chart-users", title: "New Users Over Time", kind: "chart", metric: "users" },
  { type: "chart-dau", title: "Daily Active Users Over Time", kind: "chart", metric: "dau" },
  { type: "chart-revenue", title: "Ad Revenue Over Time", kind: "chart", metric: "revenue" },
  { type: "chart-spend", title: "Media Spend Over Time", kind: "chart", metric: "spend" },
  { type: "chart-source-spend", title: "Spend by Media Source", kind: "chart", metric: "source-spend" },
  { type: "d3-users-line", title: "New Users · D3 Line", kind: "chart", metric: "users", engine: "d3", chartType: "line" },
  { type: "d3-revenue-area", title: "Ad Revenue · D3 Area", kind: "chart", metric: "revenue", engine: "d3", chartType: "area" },
  { type: "d3-spend-area", title: "Media Spend · D3 Area", kind: "chart", metric: "spend", engine: "d3", chartType: "area" },
  { type: "d3-source-line", title: "Spend by Source · D3 Line", kind: "chart", metric: "source-spend", engine: "d3", chartType: "line" },
  { type: "d3-source-bar", title: "Spend by Source · D3 Bar", kind: "chart", metric: "source-spend", engine: "d3", chartType: "bar" },
  { type: "d3-source-stacked-bar", title: "Spend by Source · D3 Stacked Bar", kind: "chart", metric: "source-spend", engine: "d3", chartType: "stacked-bar" },
  { type: "d3-source-stacked-area", title: "Spend by Source · D3 Stacked Area", kind: "chart", metric: "source-spend", engine: "d3", chartType: "stacked-area" },
  { type: "d3-source-pie", title: "Spend Share · D3 Pie", kind: "chart", metric: "source-spend", engine: "d3", chartType: "pie" },
  { type: "d3-source-donut", title: "Spend Share · D3 Donut", kind: "chart", metric: "source-spend", engine: "d3", chartType: "donut" },
  { type: "d3-installs-donut", title: "Installs by Media Source · D3 Donut", kind: "chart", metric: "source-installs", engine: "d3", chartType: "donut" },
  { type: "d3-source-bar-total", title: "Spend by Media Source · D3 Bar", kind: "chart", metric: "source-total-spend", engine: "d3", chartType: "category-bar" },
  { type: "d3-source-treemap", title: "Spend Share · D3 Treemap", kind: "chart", metric: "source-spend", engine: "d3", chartType: "treemap" },
  { type: "d3-source-heatmap", title: "Daily Spend by Source · D3 Heatmap", kind: "chart", metric: "source-spend", engine: "d3", chartType: "heatmap" },
  { type: "d3-source-scatter", title: "Spend vs Installs · D3 Scatter", kind: "chart", metric: "source-efficiency", engine: "d3", chartType: "scatter" },
  { type: "d3-users-histogram", title: "Daily Users Distribution · D3 Histogram", kind: "chart", metric: "users", engine: "d3", chartType: "histogram" },
  { type: "d3-users-gauge", title: "New Users Goal · D3 Speedometer", kind: "chart", metric: "users", engine: "d3", chartType: "gauge", goal: 100000 },
  { type: "d3-revenue-gauge", title: "Revenue Goal · D3 Speedometer", kind: "chart", metric: "revenue", engine: "d3", chartType: "gauge", goal: 100000 },
  { type: "d3-dau-gauge", title: "DAU Goal · D3 Speedometer", kind: "chart", metric: "dau", engine: "d3", chartType: "gauge", goal: 50000 },
  { type: "d3-spend-gauge", title: "Spend Goal · D3 Speedometer", kind: "chart", metric: "spend", engine: "d3", chartType: "gauge", goal: 50000 },
  { type: "media-table", title: "Media Source Performance", kind: "table" },
];
const WIDGET_BY_TYPE = Object.fromEntries(WIDGET_DEFINITIONS.map((item) => [item.type, item]));
const DEFAULT_WIDGET_TYPES = [
  "metric-users",
  "metric-dau",
  "metric-revenue",
  "metric-spend",
  "d3-users-line",
  "d3-source-bar-total",
  "d3-installs-donut",
  "d3-revenue-area",
  "d3-source-scatter",
  "d3-source-treemap",
  "media-table",
];
const initialWidgets = DEFAULT_WIDGET_TYPES.map((type) => ({
  ...WIDGET_BY_TYPE[type],
  id: `${type}-default`,
}));
const metricCount = initialWidgets.filter((widget) => widget.kind === "metric").length;
const chartCount = initialWidgets.filter((widget) => widget.kind === "chart").length;
const tableY = 8 + Math.ceil(chartCount / 2) * 10;
const initialLayout = initialWidgets.map((widget, index) => {
  if (widget.kind === "metric") {
    return { i: widget.id, x: (index % 3) * 4, y: Math.floor(index / 3) * 4, w: 4, h: 4, minW: 3, minH: 3 };
  }
  if (widget.kind === "table") {
    return { i: widget.id, x: 0, y: tableY, w: 12, h: 13, minW: 6, minH: 8 };
  }
  const chartIndex = index - metricCount;
  return { i: widget.id, x: (chartIndex % 2) * 6, y: 8 + Math.floor(chartIndex / 2) * 10, w: 6, h: 10, minW: 4, minH: 7 };
});

const isValidSavedLayout = (saved) =>
  saved &&
  Array.isArray(saved.widgets) &&
  Array.isArray(saved.layout) &&
  saved.widgets.every((widget) =>
    widget &&
    typeof widget.id === "string" &&
    WIDGET_BY_TYPE[widget.type] &&
    widget.kind === WIDGET_BY_TYPE[widget.type].kind,
  ) &&
  saved.layout.every((item) =>
    item &&
    typeof item.i === "string" &&
    [item.x, item.y, item.w, item.h].every(Number.isFinite),
  );

/** @param {{ initialData?: { rows: object[], games: Record<string, object[]> } }} props */
export default function DashboardBuilder({ initialData = { rows: [], games: {} } }) {
  const [widgets, setWidgets] = useState(initialWidgets);
  const [layout, setLayout] = useState(initialLayout);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [days, setDays] = useState(30);
  const [scope, setScope] = useState("overall");
  const [storageError, setStorageError] = useState("");
  const { width, containerRef, mounted } = useContainerWidth();
  const rows = scope === "overall"
    ? (Array.isArray(initialData.rows) ? initialData.rows : [])
    : (Array.isArray(initialData.games?.[scope]) ? initialData.games[scope] : []);
  const selectedGameName = DASHBOARD_GAMES.find((game) => game.id === scope)?.name || "";

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (isValidSavedLayout(saved)) {
        // Restore browser-only state after hydration; the grid stays hidden until this completes.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setWidgets(saved.widgets.map((widget) => ({ ...WIDGET_BY_TYPE[widget.type], ...widget })));
        setLayout(saved.layout);
      }
    } catch {
      setStorageError("Saved layout could not be restored.");
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ widgets, layout }));
    } catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStorageError("Layout changes cannot be saved in this browser.");
    }
  }, [widgets, layout, loaded]);

  const addWidget = (type) => {
    const definition = WIDGET_BY_TYPE[type];
    if (!definition) return;
    const id = crypto.randomUUID();
    setWidgets((current) => [...current, { id, ...definition }]);
    setLayout((current) => {
      const width = definition.kind === "metric" ? 4 : definition.kind === "table" ? 12 : 6;
      const height = definition.kind === "metric" ? 4 : definition.kind === "table" ? 13 : 10;
      return [...current, {
        i: id,
        x: 0,
        y: Math.max(0, ...current.map((item) => item.y + item.h)),
        w: width,
        h: height,
        minW: definition.kind === "metric" ? 3 : definition.kind === "table" ? 6 : 4,
        minH: definition.kind === "metric" ? 3 : definition.kind === "table" ? 8 : 7,
      }];
    });
  };

  const removeWidget = (id) => {
    setWidgets((current) => current.filter((widget) => widget.id !== id));
    setLayout((current) => current.filter((item) => item.i !== id));
    setSelectedWidget((current) => current?.id === id ? null : current);
  };
  const compact = width < 760;
  const visibleLayout = compact
    ? layout.map((item, index) => ({ ...item, x: 0, y: index * 10, w: 12 }))
    : layout;

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/dashboard" className={styles.brand}>
          <span className={styles.logo}>N</span>
          <span>App Analytics</span>
        </Link>
        <nav aria-label="Analytics navigation" className={styles.nav}>
          <Link href="/dashboardbuilder" className={styles.active}><span>⌂</span>Dashboard Builder</Link>
          <Link href="/dashboard"><span>▥</span>Analytics</Link>
          <Link href="/overall"><span>↗</span>Overall Reports</Link>
          <Link href="/campwise"><span>◉</span>Campaigns</Link>
        </nav>
      </aside>

      <section className={styles.content}>
        <header className={styles.header}>
          <div>
            <div className={styles.eyebrow}>ANALYTICS WORKSPACE</div>
            <h1>Dashboard Builder</h1>
            <p>Arrange report metrics, charts, and media-source tables in one view.</p>
          </div>
          <div className={styles.toolbar}>
            <label>
              <span>Data scope</span>
              <select aria-label="Data scope" value={scope} onChange={(event) => setScope(event.target.value)}>
                <option value="overall">Overall · All games</option>
                {DASHBOARD_GAMES.map((game) => <option key={game.id} value={game.id}>{game.name}</option>)}
              </select>
            </label>
            <label>
              <span>Report period</span>
              <select aria-label="Report period" value={days} onChange={(event) => setDays(Number(event.target.value))}>
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </label>
          </div>
        </header>

        <div className={styles.builderBar}>
          <span><i />{`Showing ${scope === "overall" ? "overall data" : selectedGameName} · ${rows.length.toLocaleString("en-US")} report rows loaded`}<span className={styles.hint}> · Drag widgets to arrange and resize them</span></span>
          <div>
            <button type="button" onClick={() => { setWidgets(initialWidgets); setLayout(initialLayout); }}>Reset layout</button>
            <label className={styles.addControl}>
              <span className={styles.visuallyHidden}>Add widget</span>
              <select aria-label="Add widget" value="" onChange={(event) => event.target.value && addWidget(event.target.value)}>
                <option value="">＋ Add widget</option>
                {WIDGET_DEFINITIONS.map((item) => <option key={item.type} value={item.type}>{item.title}</option>)}
              </select>
            </label>
          </div>
        </div>
        {storageError && <p className={styles.notice} role="status">{storageError}</p>}

        <div ref={containerRef} className={styles.grid}>
          {mounted && loaded ? (
            <ReactGridLayout
              width={width}
              layout={visibleLayout}
              onLayoutChange={(next) => { if (!compact) setLayout(next); }}
              gridConfig={{ cols: 12, rowHeight: 25, margin: [14, 14], containerPadding: [0, 0] }}
              dragConfig={{ enabled: !compact, handle: ".widget-drag-handle", cancel: "details,button,input,select" }}
              resizeConfig={{ enabled: !compact }}
              compactor={verticalCompactor}
            >
              {widgets.map((widget) => (
                <article key={widget.id} className={styles.card}>
                  <div className={`widget-drag-handle ${styles.cardHeader}`}>
                    <h2>{widget.title}</h2>
                    <details className={styles.menu}>
                      <summary aria-label={`Actions for ${widget.title}`}>•••</summary>
                      <div>
                        <button type="button" onClick={() => setSelectedWidget({ ...widget, days })}>Expand</button>
                        <button type="button" onClick={() => removeWidget(widget.id)}>Remove</button>
                      </div>
                    </details>
                  </div>
                  <div className={styles.widgetContent}>
                    <WidgetRenderer widget={widget} rows={rows} days={days} />
                  </div>
                </article>
              ))}
            </ReactGridLayout>
          ) : <p className={styles.widgetStatus} role="status">Loading dashboard…</p>}
          {loaded && widgets.length === 0 && <p className={styles.empty}>Your canvas is ready. Add a widget to start building.</p>}
        </div>
        <footer className={styles.footer}>Overall and individual-game reports are preloaded when this page opens.</footer>
      </section>

      {selectedWidget && (
        <WidgetPopup
          widget={selectedWidget}
          rows={rows}
          onClose={() => setSelectedWidget(null)}
        />
      )}
    </div>
  );
}
