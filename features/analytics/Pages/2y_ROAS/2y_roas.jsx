"use client";

import { downloadRows } from "../../export";

// pages/CampWise/index.jsx
import React, { useEffect, useMemo, useState } from "react";
import axiosInstance, { getCachedResponse } from "../../api/axios";
import TopNav from "../../Components/TopNav/TopNav";
import Selector from "../../Components/Selector/Selector";
import AppWiseTable from "../../Components/Table2y_ROAS/TableROAS2y";

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
  { id: "SandBlast", name: "SandBlast" },
  { id: "X2", name: "x2 Blocks" },
  { id: "MergeHexa", name: "Hexa" },
  { id: "MTN", name: "MTN" },
  { id: "DotKnot", name: "Knots" },
  { id: "Xblock", name: "XBlock" },
];

const mapToTableRows = (data = []) =>
  data.map((x, i) => ({
    id: `${x.app_name}-${x.os}-${x.year}-${x.month}-${i}`,
    app_name: x.app_name || "",
    os: x.os || "",
    year: x.year || "",
    month: x.month || "",
    cost: x.cost ?? "",
    revenue: x.revenue ?? "",
    ltv: x.ltv ?? "",
    installs: x.installs ?? "",
    roas_d0: x.roas_d0 ?? "",
    roas_d7: x.roas_d7 ?? "",
    roas_d30: x.roas_d30 ?? "",
    roas_d60: x.roas_d60 ?? "",
    roas_d90: x.roas_d90 ?? "",
    roas_d120: x.roas_d120 ?? "",
    roas_d150: x.roas_d150 ?? "",
    roas_d180: x.roas_d180 ?? "",
    roas_d210: x.roas_d210 ?? "",
    roas_d240: x.roas_d240 ?? "",
    roas_d270: x.roas_d270 ?? "",
    roas_d300: x.roas_d300 ?? "",
    roas_d330: x.roas_d330 ?? "",
    roas_d360: x.roas_d360 ?? "",
    roas_d390: x.roas_d390 ?? "",
    roas_d420: x.roas_d420 ?? "",
    roas_d450: x.roas_d450 ?? "",
    roas_d480: x.roas_d480 ?? "",
    roas_d510: x.roas_d510 ?? "",
    roas_d540: x.roas_d540 ?? "",
    roas_d570: x.roas_d570 ?? "",
    roas_d600: x.roas_d600 ?? "",
    roas_d630: x.roas_d630 ?? "",
    roas_d660: x.roas_d660 ?? "",
    roas_d690: x.roas_d690 ?? "",
    roas_d720: x.roas_d720 ?? "",
    roas_d750: x.roas_d750 ?? "",
    roas_d780: x.roas_d780 ?? "",
    roas_d810: x.roas_d810 ?? "",
    roas_d840: x.roas_d840 ?? "",
    roas_d870: x.roas_d870 ?? "",
    roas_d900: x.roas_d900 ?? "",
    roas_d930: x.roas_d930 ?? "",
    roas_d960: x.roas_d960 ?? "",
    roas_d990: x.roas_d990 ?? "",
    roas_d1020: x.roas_d1020 ?? "",
    roas_d1050: x.roas_d1050 ?? "",
    roas_d1080: x.roas_d1080 ?? "",
  }));

/** @param {{ initialRows?: object[] | null }} props */
export default function Roas2y({ initialRows = null }) {
  const [query, setQuery] = useState("I");
  const [game, setGame] = useState("2248");
  const [raw, setRaw] = useState(() =>
    initialRows ?? getCachedResponse(
      `roas_2y/${encodeURIComponent("I")}/${encodeURIComponent("2248")}`,
    ) ?? null,
  );
  const loading = raw === null;

  const rows = useMemo(() => mapToTableRows(raw || []), [raw]);
  function buildApiUrl() {
    return `roas_2y/${encodeURIComponent(
      query
    )}/${encodeURIComponent(game)}`;
  }

  useEffect(() => {
    if (initialRows !== null && query === "I" && game === "2248") { setRaw(initialRows); return; }
    let cancelled = false;
    const url = buildApiUrl();
    setRaw(getCachedResponse(url) ?? null);
    (async () => {
      try {
        const res = await axiosInstance.get(url);
        if (!cancelled) setRaw(res.data || []);
      } catch {
        if (!cancelled) setRaw([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query, game, initialRows]);

  const handleIdChange = (id) => setGame(id);
  const handleQueryChange = (q) => setQuery(q);

  const handleDownload = () => downloadRows(rows, `${game}-${query}.xlsx`);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      {/* TOP NAV */}
      <div style={{ position: "sticky", top: 0, zIndex: 1000 }}>
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
      </div>

      <div style={{ marginTop: "100px" }}>
        {/* GAME FILTER */}
        <div
          style={{
            padding: "16px",
            textAlign: "center",
            background: "#f9f9f9",
            borderBottom: "1px solid #ddd",
          }}
        >
          <label style={{ marginRight: "8px", fontWeight: "bold" }}>
            Select Game:
          </label>
          <select
            value={game}
            onChange={(e) => setGame(e.target.value)}
            style={{ padding: "6px 12px", borderRadius: "6px" }}
          >
            {GAMESQuery.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* TABLE */}
        <div style={{ flex: 1, padding: "20px" }}>
          <AppWiseTable rows={rows} loading={loading} />
        </div>
      </div>
      {/* SEARCH/SELECTOR */}
      <div style={{ margin: "24px", paddingBottom: "16px" }}>
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
