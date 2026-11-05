"use client";

import { downloadRows } from "../../export";

// pages/CampWise/index.jsx
import React, { useEffect, useMemo, useState } from "react";
import axiosInstance, { getCachedResponse } from "../../api/axios";
import TopNav from "../../Components/TopNav/TopNav";
import Selector from "../../Components/Selector/Selector";
import CampWiseTable from "../../Components/QuestionsTableCampWise/QuestionsTableCampWise";
import LineChart from "../../Components/Charts/LineChart";
import DualMultiLineChart from "../../Components/Charts/DualMultiLineChart";
import moment from "moment";

// charts modal + icon button
import BasicModal from "../../Components/BasicModal/BasicModal";
import {
  IconButton,
  Button,
  Popover,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import SettingsOverscanIcon from "@mui/icons-material/SettingsOverscan";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { DateRangePicker } from "react-date-range";
import { subDays } from "date-fns";

// --- constants for layout ---
const TOPNAV_H = 64;
const FILTER_BAR_H = 80;

const fmtDateString = (d) => {
  const dt = typeof d === "string" ? new Date(d) : d;
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const yesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d;
};
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

const USE_PLACEHOLDERS = true;

const GAMES = [
  { id: "2248", name: "2248" },
  { id: "sandblast", name: "SandBlast" },
  { id: "x2", name: "x2 Blocks" },
  { id: "x7", name: "Hexa" },
  { id: "MTN", name: "MTN" },
  { id: "knots", name: "Knots" },
  { id: "xblock", name: "XBlock" },
  { id: "matchme", name: "MatchMe" },
  { id: "2248china", name: "2248 China" },
  { id: "x2china", name: "x2 China" },
];
const GAMESQuery = [
  { id: "2248", name: "2248" },
  { id: "sandblast", name: "SandBlast" },
  { id: "x2", name: "x2 Blocks" },
  { id: "x7", name: "Hexa" },
  { id: "MTN", name: "MTN" },
  { id: "knots", name: "Knots" },
  { id: "xblock", name: "XBlock" },
  { id: "matchme", name: "MatchMe" },
];

// keep numbers raw (table formats/rounds)
const mapToTableRows = (data = []) => {
  
  data?.map((x, i) => ({
    id: `${x.dt?.value}-${x.c}-${x.pid}-${i}`,
    date: x.dt?.value || "",
    campaign: x.c || "",
    network: x.pid || "",
    cost: x.cost ?? "",
    users: x.users ?? "",
    geo: x.geo || "",
    roas_d0: x.r0 ?? "",
    roas_d7: x.r7 ?? "",
    roas_d14: x.r14 ?? "",
    roas_d28: x.r30 ?? "", // r30 shown as D28 in table
    retention_d1: x.ret1 ?? "",
    retention_d7: x.ret7 ?? "",
    retention_d14: x.ret14 ?? "",
    retention_d30: x.ret30 ?? "",
  }));
};

const unique = (arr) => Array.from(new Set(arr)).filter(Boolean).sort();

/** Build compact chart series */
function buildChartsData(rows = []) {
  const bucket = new Map();
  let hasR14 = false,
    hasR30 = false,
    hasRet14 = false;

  for (const r of rows) {
    const d = r?.date ? String(r.date) : "";
    if (!d) continue;
    if (!bucket.has(d)) {
      bucket.set(d, {
        cost: 0,
        users: 0,
        w0: 0,
        w7: 0,
        w14: 0,
        w30: 0,
        rden: 0,
        d1: 0,
        d7: 0,
        d14: 0,
        d30: 0,
        uden: 0,
      });
    }
    const b = bucket.get(d);
    const cost = Number(r.cost) || 0;
    const users = Number(r.users) || 0;

    const r0 = Number(r.roas_d0);
    const r7 = Number(r.roas_d7);
    const r14 = Number(r.roas_d14);
    const r30 = Number(r.roas_d28);

    const ret1 = Number(r.retention_d1);
    const ret7 = Number(r.retention_d7);
    const ret14 = Number(r.retention_d14);
    const ret30 = Number(r.retention_d30);

    b.cost += cost;
    b.users += users;

    if (Number.isFinite(r0)) b.w0 += r0 * cost;
    if (Number.isFinite(r7)) b.w7 += r7 * cost;
    if (Number.isFinite(r14)) {
      b.w14 += r14 * cost;
      hasR14 = true;
    }
    if (Number.isFinite(r30)) {
      b.w30 += r30 * cost;
      hasR30 = true;
    }
    b.rden += cost || 0.000001;

    if (Number.isFinite(ret1)) b.d1 += ret1 * users;
    if (Number.isFinite(ret7)) b.d7 += ret7 * users;
    if (Number.isFinite(ret14)) {
      b.d14 += ret14 * users;
      hasRet14 = true;
    }
    if (Number.isFinite(ret30)) b.d30 += ret30 * users;
    b.uden += users || 0.000001;
  }

  const roasSeries = [];
  const retentionSeries = [];
  const dates = Array.from(bucket.keys()).sort(
    (a, b) => new Date(a) - new Date(b),
  );

  for (const d of dates) {
    const b = bucket.get(d);
    const date = moment(d);
    const chartDate = date.isValid() ? date.startOf("day").valueOf() : d;

    roasSeries.push({
      date: chartDate,
      value: Number((b.w0 / b.rden).toFixed(1)),
      category: "ROAS D0",
    });
    roasSeries.push({
      date: chartDate,
      value: Number((b.w7 / b.rden).toFixed(1)),
      category: "ROAS D7",
    });
    if (hasR14)
      roasSeries.push({
        date: chartDate,
        value: Number((b.w14 / b.rden).toFixed(1)),
        category: "ROAS D14",
      });
    if (hasR30)
      roasSeries.push({
        date: chartDate,
        value: Number((b.w30 / b.rden).toFixed(1)),
        category: "ROAS D30",
      });

    retentionSeries.push({
      date: chartDate,
      value: Number((b.d1 / b.uden).toFixed(1)),
      category: "Retention D1",
    });
    retentionSeries.push({
      date: chartDate,
      value: Number((b.d7 / b.uden).toFixed(1)),
      category: "Retention D7",
    });
    if (hasRet14)
      retentionSeries.push({
        date: chartDate,
        value: Number((b.d14 / b.uden).toFixed(1)),
        category: "Retention D14",
      });
    retentionSeries.push({
      date: chartDate,
      value: Number((b.d30 / b.uden).toFixed(1)),
      category: "Retention D30",
    });
  }
  return { roasSeries, retentionSeries };
}

/** Aggregate rows only over the hidden columns. */
function aggregateByRemovedColumns(rows = [], { dropDate, dropGeo }) {
  const groupFields = ["campaign", "network"];
  if (!dropDate) groupFields.push("date");
  if (!dropGeo) groupFields.push("geo");

  const bucket = new Map();

  const getKey = (r) =>
    JSON.stringify(Object.fromEntries(groupFields.map((f) => [f, r[f] ?? ""])));

  for (const r of rows) {
    const key = getKey(r);
    if (!bucket.has(key)) {
      const base = {};
      for (const f of groupFields) base[f] = r[f] ?? "";

      bucket.set(key, {
        ...base,
        cost: 0,
        users: 0,

        w0: 0,
        w7: 0,
        w14: 0,
        w28: 0,
        rden: 0,
        d1: 0,
        d7: 0,
        d14: 0,
        d30: 0,
        uden: 0,
      });
    }

    const b = bucket.get(key);

    const cost = Number(r.cost) || 0;
    const users = Number(r.users) || 0;

    const r0 = Number(r.roas_d0);
    const r7 = Number(r.roas_d7);
    const r14 = Number(r.roas_d14);
    const r28 = Number(r.roas_d28);

    const ret1 = Number(r.retention_d1);
    const ret7 = Number(r.retention_d7);
    const ret14 = Number(r.retention_d14);
    const ret30 = Number(r.retention_d30);

    b.cost += cost;
    b.users += users;

    if (Number.isFinite(r0)) b.w0 += r0 * cost;
    if (Number.isFinite(r7)) b.w7 += r7 * cost;
    if (Number.isFinite(r14)) b.w14 += r14 * cost;
    if (Number.isFinite(r28)) b.w28 += r28 * cost;
    b.rden += cost || 0.000001;

    if (Number.isFinite(ret1)) b.d1 += ret1 * users;
    if (Number.isFinite(ret7)) b.d7 += ret7 * users;
    if (Number.isFinite(ret14)) b.d14 += ret14 * users;
    if (Number.isFinite(ret30)) b.d30 += ret30 * users;
    b.uden += users || 0.000001;
  }

  // Build final rows
  return Array.from(bucket.values()).map((b, i) => ({
    id: `aggr-${i}`,

    date: dropDate ? "" : (b.date ?? ""),
    geo: dropGeo ? "" : (b.geo ?? ""),
    campaign: b.campaign ?? "",
    network: b.network ?? "",
    cost: b.cost,
    users: b.users,
    roas_d0: (b.w0 / b.rden).toFixed(1),
    roas_d7: (b.w7 / b.rden).toFixed(1),
    roas_d14: (b.w14 / b.rden).toFixed(1),
    roas_d28: (b.w28 / b.rden).toFixed(1),
    retention_d1: (b.d1 / b.uden).toFixed(1),
    retention_d7: (b.d7 / b.uden).toFixed(1),
    retention_d14: (b.d14 / b.uden).toFixed(1),
    retention_d30: (b.d30 / b.uden).toFixed(1),
  }));
}

/** @param {{ initialData?: { rows: object[], options: object[], startDate: string, endDate: string } | null }} props */
export default function CampWise({ initialData = null }) {
  const [query, setQuery] = useState("AI");
  const [game, setGame] = useState("x2");
  const [media, setMedia] = useState("");
  const [campaign, setCampaign] = useState("");

  // NEW: column toggles
  const [showDateCol, setShowDateCol] = useState(true);
  const [showGeoCol, setShowGeoCol] = useState(true);

  const [startDate, setStartDate] = useState(initialData?.startDate || fmtDateString(daysAgo(30)));
  const [endDate, setEndDate] = useState(initialData?.endDate || fmtDateString(yesterday()));

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const popId = open ? "simple-popover" : undefined;

  const [state, setState] = useState([
    {
      startDate: subDays(new Date(), 30),
      endDate: subDays(new Date(), 1),
      key: "selection",
    },
  ]);
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);

  const initialFilteredUrl = [
    "ret_roas",
    encodeURIComponent(query),
    encodeURIComponent(game),
    encodeURIComponent(startDate),
    encodeURIComponent(endDate),
    "-",
    "-",
  ].join("/");

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const applyDateFilter = () => {
    setStartDate(tempStart);
    setEndDate(tempEnd);
    handleClose();
  };

  const [raw, setRaw] = useState(
    () => initialData?.rows ?? getCachedResponse(initialFilteredUrl) ?? null,
  );
  const [baseForOptions, setBaseForOptions] = useState(initialData?.options || []);
  const loading = raw === null;

  const [openCharts, setOpenCharts] = useState({
    boolRoas: false,
    boolRet: false,
  });

  const baseRows = useMemo(() => mapToTableRows(raw || []), [raw]);

  // Aggregate by campaign when any of the two columns is hidden
  // Aggregate only over the columns that are hidden
  const rows = useMemo(() => {
    const dropDate = !showDateCol;
    const dropGeo = !showGeoCol;
    if (!dropDate && !dropGeo) return baseRows; // nothing hidden -> raw
    return aggregateByRemovedColumns(baseRows, { dropDate, dropGeo });
  }, [baseRows, showDateCol, showGeoCol]);

  const mediaOptions = useMemo(
    () => unique((baseForOptions || []).map((r) => r.pid)),
    [baseForOptions],
  );
  const campaignOptions = useMemo(
    () => unique((baseForOptions || []).map((r) => r.c)),
    [baseForOptions],
  );

  const { roasSeries, retentionSeries } = useMemo(
    () => buildChartsData(baseRows),
    [baseRows],
  );

  function buildApiUrl({ withFilters }) {
    if (!withFilters) {
      return `ret_roas/${encodeURIComponent(query)}/${encodeURIComponent(
        game,
      )}`;
    }
    const s = fmtDateString(startDate);
    const e = fmtDateString(endDate);
    const campSeg =
      USE_PLACEHOLDERS && (!campaign || !campaign.trim()) ? "-" : campaign;
    const mediaSeg =
      USE_PLACEHOLDERS && (!media || !media.trim()) ? "-" : media;

    return [
      "ret_roas",
      encodeURIComponent(query),
      encodeURIComponent(game),
      encodeURIComponent(s),
      encodeURIComponent(e),
      encodeURIComponent(campSeg),
      encodeURIComponent(mediaSeg),
    ].join("/");
  }

  // Fetch base data (options)
  useEffect(() => {
    if (initialData && query === "AI" && game === "x2") { setBaseForOptions(initialData.options); return; }
    let cancelled = false;
    (async () => {
      try {
        const res = await axiosInstance.get(
          buildApiUrl({ withFilters: false }),
        );
        if (!cancelled) setBaseForOptions(res.data || []);
        
      } catch {
        if (!cancelled) setBaseForOptions([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query, game, initialData]);

  // Fetch filtered data
  useEffect(() => {
    if (initialData && query === "AI" && game === "x2" && startDate === initialData.startDate && endDate === initialData.endDate && !campaign && !media) { setRaw(initialData.rows); return; }
    let cancelled = false;
    const url = buildApiUrl({ withFilters: true });
    setRaw(getCachedResponse(url) ?? null);
    (async () => {
      try {
        
        const res = await axiosInstance.get(url);
        if (!cancelled) setRaw(res?.data || []);
      } catch {
        if (!cancelled) setRaw([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query, game, startDate, endDate, campaign, media, initialData]);

  const handleIdChange = (id) => setGame(id);
  const handleQueryChange = (q) => setQuery(q);

  useEffect(() => {
    setMedia("");
    setCampaign("");
  }, [game, query]);

  const handleDownload = () => downloadRows(rows, `${game}-${query}.xlsx`);

  return (
    <div style={{ paddingTop: 8 }}>
      <TopNav
        setData={() => {}}
        dataSets={rows}
        showGraph={false}
        back={null}
        setCount={() => {}}
        setShowGraph={() => {}}
        questions={raw || []}
        handleDownload={handleDownload}
        handleExpand={() => {}}
        showFullMonthTable={false}
        signout={() => {}}
        handleIdChange={handleIdChange}
        games={GAMES}
        game={game}
        query={query}
      />

      {/* FILTER BAR — sticky and above */}
      <div
        style={{
          position: "sticky",
          top: TOPNAV_H,
          background: "#fff",
          padding: "12px 16px",
          borderBottom: "1px solid #eee",
          zIndex: 1200,
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(160px, 1fr))",
          gap: 12,
          alignItems: "center",
        }}
      >
        {/* Date filter trigger */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, color: "#555" }}>Date range</span>
          <div style={{ display: "flex", alignItems: "center", height: 40 }}>
            <IconButton onClick={handleClick}>
              <CalendarMonthIcon />
            </IconButton>
            <div style={{ marginLeft: 8, fontSize: 13, color: "#333" }}>
              {startDate} – {endDate}
            </div>
          </div>
        </div>

        {/* Game */}
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, color: "#555" }}>Game</span>
          <select
            value={game}
            onChange={(e) => setGame(e.target.value)}
            style={{ padding: 8 }}
          >
            {GAMESQuery.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </label>

        {/* Media Source */}
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, color: "#555" }}>Media source</span>
          <select
            value={media}
            onChange={(e) => setMedia(e.target.value)}
            style={{ padding: 8 }}
          >
            <option value="">All</option>
            {mediaOptions.map((ms) => (
              <option key={ms} value={ms}>
                {ms}
              </option>
            ))}
          </select>
        </label>

        {/* Campaign */}
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, color: "#555" }}>Campaign</span>
          <select
            value={campaign}
            onChange={(e) => setCampaign(e.target.value)}
            style={{ padding: 8 }}
          >
            <option value="">All</option>
            {campaignOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        {/* ⬇️ NEW: Column toggles */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={showDateCol}
                onChange={(e) => setShowDateCol(e.target.checked)}
              />
            }
            label="Show Date column"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={showGeoCol}
                onChange={(e) => setShowGeoCol(e.target.checked)}
              />
            }
            label="Show Geo column"
          />
        </div>

        {/* spacer */}
        <div />
      </div>

      {/* Date Range Popover */}
      <Popover
        id={popId}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <div
          style={{
            paddingBottom: 10,
            paddingTop: 10,
            paddingLeft: 6,
            paddingRight: 6,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
          }}
        >
          <DateRangePicker
            onChange={(item) => {
              setState([item.selection]);
              setTempStart(
                moment(item.selection.startDate).format("YYYY-MM-DD"),
              );
              setTempEnd(moment(item.selection.endDate).format("YYYY-MM-DD"));
            }}
            showSelectionPreview={true}
            moveRangeOnFirstSelection={false}
            months={2}
            ranges={state}
            direction="horizontal"
          />
          <Button sx={{ height: 50 }} onClick={applyDateFilter}>
            Filter
          </Button>
        </div>
      </Popover>

      {/* Spacer under sticky bar */}
      <div style={{ height: FILTER_BAR_H }} />

      {/* ======== SMALL CHARTS ======== */}
      <div
        style={{
          margin: "8px 0 12px",
          display: "flex",
          justifyContent: "flex-start",
        }}
      >
        <div
          style={{
            width: 860,
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: 10,
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
            Overview
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <div
              style={{
                flex: "1 1 0",
                border: "1px solid #eef2f7",
                borderRadius: 8,
                padding: "6px 8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <div style={{ fontWeight: 500, fontSize: 13 }}>
                  ROAS (D0/D7/D14/D30)
                </div>
                <IconButton
                  size="small"
                  onClick={() =>
                    setOpenCharts((o) => ({ ...o, boolRoas: true }))
                  }
                >
                  <SettingsOverscanIcon fontSize="small" />
                </IconButton>
              </div>
              <div style={{ width: "100%", height: 180 }}>
                <LineChart data={roasSeries} />
              </div>
              <BasicModal
                handleClose={() =>
                  setOpenCharts((o) => ({ ...o, boolRoas: false }))
                }
                open={openCharts}
                setOpen={setOpenCharts}
                bool="boolRoas"
              >
                <div style={{ width: "100%", height: "100%" }}>
                  <h3 style={{ fontWeight: 500, margin: "0 0 8px" }}>ROAS</h3>
                  <DualMultiLineChart data={roasSeries} />
                </div>
              </BasicModal>
            </div>

            <div
              style={{
                flex: "1 1 0",
                border: "1px solid #eef2f7",
                borderRadius: 8,
                padding: "6px 8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <div style={{ fontWeight: 500, fontSize: 13 }}>
                  Retention (D1/D7/D14/D30)
                </div>
                <IconButton
                  size="small"
                  onClick={() =>
                    setOpenCharts((o) => ({ ...o, boolRet: true }))
                  }
                >
                  <SettingsOverscanIcon fontSize="small" />
                </IconButton>
              </div>
              <div style={{ width: "100%", height: 180 }}>
                <LineChart data={retentionSeries} />
              </div>
              <BasicModal
                handleClose={() =>
                  setOpenCharts((o) => ({ ...o, boolRet: false }))
                }
                open={openCharts}
                setOpen={setOpenCharts}
                bool="boolRet"
              >
                <div style={{ width: "100%", height: "100%" }}>
                  <h3 style={{ fontWeight: 500, margin: "0 0 8px" }}>
                    Retention
                  </h3>
                  <DualMultiLineChart data={retentionSeries} />
                </div>
              </BasicModal>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div style={{ marginTop: 8 }}>
        <CampWiseTable
          rows={rows}
          loading={loading}
          showDateCol={showDateCol}
          showGeoCol={showGeoCol}
        />
      </div>

      <div style={{ marginTop: 24 }}>
        <Selector
          loader={() => {}}
          count={0}
          setCount={() => {}}
          onQueryChange={handleQueryChange}
          query={query}
          game1={game}
        />
      </div>
    </div>
  );
}
