"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import ReactGridLayout, {
  useContainerWidth,
  verticalCompactor,
} from "react-grid-layout";
import WidgetRenderer from "./WidgetRenderer";
import WidgetPopup from "./WidgetPopup";
import styles from "./dashboard.module.css";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const STORAGE_KEY = "analytics-dashboard-layout-v1";
const titles = {
  traffic: "Traffic Over Time",
  bars: "Revenue by Channel",
  device: "Users by Device",
  area: "Active Users (Area)",
  scatter: "Session Duration vs. Pages per Session",
  treemap: "Traffic by Page (Treemap)",
  revenue: "Revenue",
  dau: "New vs DAU",
  retention: "Retention",
  roas: "ROAS",
};
const initialWidgets = [
  "traffic",
  "bars",
  "device",
  "area",
  "scatter",
  "treemap",
].map((type) => ({ id: `${type}-1`, type, title: titles[type] }));
const initialLayout = initialWidgets.map((widget, i) => ({
  i: widget.id,
  x: (i % 3) * 4,
  y: Math.floor(i / 3) * 8,
  w: 4,
  h: 8,
  minW: 3,
  minH: 6,
}));
const metrics = [
  {
    label: "Users",
    value: 124893,
    change: "+12.6%",
    icon: "♧",
    color: "#247cff",
    bg: "#edf5ff",
  },
  {
    label: "Traffic",
    value: 428720,
    change: "+18.4%",
    icon: "↗",
    color: "#13bc7e",
    bg: "#ecfbf5",
  },
  {
    label: "Revenue",
    value: 96540,
    change: "+22.1%",
    icon: "＄",
    color: "#8d4df5",
    bg: "#f4efff",
  },
  {
    label: "Conversions",
    value: 3.78,
    change: "+0.64 pp",
    icon: "▥",
    color: "#ff941e",
    bg: "#fff5eb",
  },
];

export default function DashboardBuilder() {
  const [widgets, setWidgets] = useState(initialWidgets);
  const [layout, setLayout] = useState(initialLayout);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [days, setDays] = useState(30);
  const [storageError, setStorageError] = useState("");
  const { width, containerRef, mounted } = useContainerWidth();
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (
        saved &&
        Array.isArray(saved.widgets) &&
        Array.isArray(saved.layout) &&
        saved.widgets.every(
          (w) => w && typeof w.id === "string" && titles[w.type],
        ) &&
        saved.layout.every(
          (l) =>
            l &&
            typeof l.i === "string" &&
            [l.x, l.y, l.w, l.h].every(Number.isFinite),
        )
      ) {
        setWidgets(saved.widgets);
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
      setStorageError("Layout changes cannot be saved in this browser.");
    }
  }, [widgets, layout, loaded]);
  const addWidget = (type) => {
    const id = crypto.randomUUID();
    setWidgets((prev) => [...prev, { id, type, title: titles[type] }]);
    setLayout((prev) => [
      ...prev,
      {
        i: id,
        x: 0,
        y: Math.max(0, ...prev.map((l) => l.y + l.h)),
        w: 4,
        h: 8,
        minW: 3,
        minH: 6,
      },
    ]);
  };
  const compact = width < 760;
  const visibleLayout = compact
    ? layout.map((item, i) => ({ ...item, x: 0, y: i * 8, w: 12, h: 8 }))
    : layout;
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/dashboard" className={styles.brand}>
          <span className={styles.logo}>N</span>
          <span>App Analytics</span>
        </Link>
        <nav aria-label="Analytics navigation" className={styles.nav}>
          <Link href="/dashboardbuilder" className={styles.active}>
            <span>⌂</span>Dashboard Builder
          </Link>
          <Link href="/dashboard">
            <span>▥</span>Analytics
          </Link>
          <Link href="/overall">
            <span>↗</span>Overall Reports
          </Link>
          <Link href="/campwise">
            <span>◉</span>Campaigns
          </Link>
        </nav>
      </aside>
      <section className={styles.content}>
        <header className={styles.header}>
          <div>
            <div className={styles.eyebrow}>ANALYTICS WORKSPACE</div>
            <h1>Dashboard</h1>
          </div>
          <div className={styles.toolbar}>
            <select
              aria-label="Date range"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            >
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
            </select>
            <span className={styles.avatar} aria-label="Dashboard workspace">
              AA
            </span>
          </div>
        </header>
        <div className={styles.metrics}>
          {metrics.map((m, i) => (
            <article
              key={m.label}
              className={styles.metric}
              style={{ background: m.bg, "--accent": m.color }}
            >
              <span className={styles.metricIcon}>{m.icon}</span>
              <div>
                <h2>{m.label}</h2>
                <strong>
                  {i === 3
                    ? "3.78%"
                    : `${i === 2 ? "$" : ""}${Math.round((m.value * days) / 30).toLocaleString("en-US")}`}
                </strong>
                <b>↑ {m.change}</b>
                <small>vs. previous {days} days</small>
              </div>
              <svg viewBox="0 0 90 40" aria-hidden="true">
                <path d="M2 33 Q12 23 20 29 T40 26 T60 17 T76 12 T88 8" />
              </svg>
            </article>
          ))}
        </div>
        <div className={styles.builderBar}>
          <span>
            <i />
            {/* Demo data{" "} */}
            <span className={styles.hint}>
              · Drag headers to arrange, resize from corners
            </span>
          </span>
          <div>
            <button
              onClick={() => {
                setWidgets(initialWidgets);
                setLayout(initialLayout);
              }}
            >
              Reset layout
            </button>
            <select
              aria-label="Add widget"
              value=""
              onChange={(e) => {
                if (e.target.value) addWidget(e.target.value);
              }}
            >
              <option value="">＋ Add Widget</option>
              {Object.entries(titles).map(([type, title]) => (
                <option key={type} value={type}>
                  {title}
                </option>
              ))}
            </select>
          </div>
        </div>
        {storageError && <p role="status">{storageError}</p>}
        <div ref={containerRef} className={styles.grid}>
          {mounted && loaded ? (
            <ReactGridLayout
              width={width}
              layout={visibleLayout}
              onLayoutChange={(next) => {
                if (!compact) setLayout(next);
              }}
              gridConfig={{
                cols: 12,
                rowHeight: 26,
                margin: [16, 16],
                containerPadding: [0, 0],
              }}
              dragConfig={{
                enabled: !compact,
                handle: ".widget-drag-handle",
                cancel: "details",
              }}
              resizeConfig={{ enabled: !compact }}
              compactor={verticalCompactor}
            >
              {widgets.map((widget) => (
                <div key={widget.id} className={styles.card}>
                  <div className={`widget-drag-handle ${styles.cardHeader}`}>
                    <h2>
                      {widget.title}{" "}
                      <span title="Illustrative sample data">ⓘ</span>
                    </h2>
                    <details className={styles.menu}>
                      <summary aria-label={`Actions for ${widget.title}`}>
                        •••
                      </summary>
                      <div>
                        <button
                          onClick={() => setSelectedWidget({ ...widget, days })}
                        >
                          Expand
                        </button>
                        <button
                          onClick={() => {
                            setWidgets((prev) =>
                              prev.filter((w) => w.id !== widget.id),
                            );
                            setLayout((prev) =>
                              prev.filter((l) => l.i !== widget.id),
                            );
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </details>
                  </div>
                  <div className={styles.chart}>
                    <WidgetRenderer widget={widget} days={days} />
                  </div>
                </div>
              ))}
            </ReactGridLayout>
          ) : (
            <p role="status">Loading dashboard…</p>
          )}
          {loaded && widgets.length === 0 && (
            <p className={styles.empty}>
              Your canvas is ready. Add a widget to start building.
            </p>
          )}
        </div>
        <footer className={styles.footer}>
          Sample analytics for exploration{" "}
        </footer>
      </section>
      {selectedWidget && (
        <WidgetPopup
          widget={selectedWidget}
          onClose={() => setSelectedWidget(null)}
        />
      )}
    </div>
  );
}
