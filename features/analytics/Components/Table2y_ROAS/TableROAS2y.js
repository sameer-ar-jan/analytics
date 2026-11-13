import BigNumber from "bignumber.js";
// Components/QuestionsTableAppWise/QuestionsTableAppWise.jsx
import React, { useEffect, useState, useMemo } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Skeleton from "@mui/material/Skeleton";
import { styled } from "@mui/system";
import classes from "./TableROAS2y.module.css";

const TableCellDate = styled(TableCell)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// Treat "0", "0.0", "0.00", 0, "0%" (and with commas/spaces) as zero
const isZeroish = (val) => {
  if (val === null || val === undefined) return false;
  const s = String(val).trim();
  if (s === "") return false;
  const normalized = s.replace(/[, ]/g, "").replace(/%$/, "");
  const n = Number(normalized);
  return Number.isFinite(n) && n === 0;
};

function roundToDecimal(value, decimalPlaces = 2) {
  const bn = new BigNumber(value);
  return bn?.isFinite() ? bn.toFixed(decimalPlaces) : "0";
}

function replaceNaNWithZero(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function fmtInt(value) {
  const n = replaceNaNWithZero(value);
  return Math.round(n).toLocaleString();
}

function fmt2(value) {
  const n = new BigNumber(value);
  return n?.isFinite() ? n.toFixed(2) : "0.00";
}

function CommaSeparated(number) {
  const n = replaceNaNWithZero(number);
  return Number(n).toLocaleString();
}

const CORE_COLS = [
  { key: "app_name", label: "App", align: "left" },
  { key: "os", label: "OS", align: "left" },
  { key: "year", label: "Year", align: "right", numeric: true },
  { key: "month", label: "Month", align: "right", numeric: true },
];

const METRIC_COLS = [
  { key: "cost", label: "Cost", align: "right", fmt: fmtInt, numeric: true },
  {
    key: "revenue",
    label: "Revenue",
    align: "right",
    fmt: fmtInt,
    numeric: true,
  },
  { key: "ltv", label: "LTV", align: "right", fmt: fmt2, numeric: true },
  {
    key: "installs",
    label: "Installs",
    align: "right",
    fmt: fmtInt,
    numeric: true,
  },
];

// renderer
function renderValue(col, raw) {
  if (col.fmt) return col.fmt(raw);
  if (col.numeric) {
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  }
  if (raw === "NaN") return "0";
  return raw ?? "";
}

// sticky config (only year & month)
const YEAR_WIDTH = 88; // tune as needed
const MONTH_WIDTH = 80; // tune as needed
const STICKY_OFFSETS = {
  year: 0,
  month: YEAR_WIDTH + 30,
};

export default function QuestionsTableAppWise({
  rows = [],
  loading = false,
  showFull = true,
}) {
  const [visibleRows, setVisibleRows] = useState([]);

  // 🔥 Auto-detect all roas_* keys and sort by the numeric day (handles d1020, d1080, etc.)
  const roasKeys = useMemo(() => {
    const keys = new Set();
    for (const r of rows || []) {
      for (const k of Object.keys(r || {})) {
        if (k.startsWith("roas_")) keys.add(k);
      }
    }
    return Array.from(keys).sort((a, b) => {
      const na = parseInt((a.match(/^roas_d(\d+)$/) || [])[1] || "0", 10);
      const nb = parseInt((b.match(/^roas_d(\d+)$/) || [])[1] || "0", 10);
      return na - nb;
    });
  }, [rows]);

  // ✅ Build column defs from those keys
  const ROAS_COLS = useMemo(
    () =>
      roasKeys.map((k) => ({
        key: k,
        label: k.replace("roas_", "").toUpperCase(),
        align: "right",
        fmt: fmt2,
        numeric: true,
      })),
    [roasKeys],
  );

  // (Optional but helpful) ensure every row has every roas_* key so they always render
  const normalizedRows = useMemo(() => {
    if (!rows?.length) return rows;
    return rows.map((r) => {
      const fill = {};
      for (const k of roasKeys) if (!(k in r)) fill[k] = 0;
      return { ...fill, ...r };
    });
  }, [rows, roasKeys]);

  // Use normalizedRows so missing keys still draw as 0
  useEffect(() => {
    setVisibleRows(normalizedRows || []);
  }, [normalizedRows]);

  // Build the full column list from dynamic ROAS columns
  const ALL_COLS = useMemo(
    () => [...CORE_COLS, ...METRIC_COLS, ...ROAS_COLS],
    [ROAS_COLS],
  );

  return (
    <TableContainer
      component={Paper}
      className={classes?.styles}
      sx={{
        maxHeight: "75vh",
        overflowX: "auto",
        overflowY: "auto",
        border: "1px solid #cccccc",
      }}
    >
      <Table
        stickyHeader
        size="small"
        aria-label="app metrics table"
        sx={{
          minWidth: Math.max(1200, ALL_COLS.length * 110), // dynamic width to fit all columns
          borderSpacing: 0,
        }}
      >
        <TableHead
          sx={{ position: "sticky", top: 0, zIndex: 2 }}
          className={classes?.Thead}
        >
          {/* Group row */}
          <TableRow
            className={classes?.tableRow}
            sx={{ height: "3rem !important" }}
          >
            {/* Info group */}
            <TableCell
              className={classes?.group1}
              align="left"
              sx={{
                backgroundColor: "#faf9f6",
                whiteSpace: "nowrap",
                fontWeight: 600,
                borderRight: "1px solid #c3c3c3",
              }}
              colSpan={CORE_COLS.length}
            >
              Info
            </TableCell>

            <TableCell
              className={classes?.group2}
              align="center"
              sx={{
                backgroundColor: "#faf9f6",
                fontWeight: 600,
                borderRight: "1px solid #c3c3c3 !important",
              }}
              colSpan={METRIC_COLS.length}
            >
              Spend & Users
            </TableCell>

            <TableCell
              className={classes?.group2}
              align="center"
              sx={{ backgroundColor: "#faf9f6", fontWeight: 600 }}
              colSpan={ROAS_COLS.length}
            >
              ROAS (Days)
            </TableCell>
          </TableRow>

          {/* Labels row */}
          <TableRow
            className={classes?.tableRow}
            sx={{ height: "3rem !important" }}
          >
            {CORE_COLS.map((col) => {
              const isSticky = col.key === "year" || col.key === "month";
              const left = STICKY_OFFSETS[col.key] ?? undefined;
              const width =
                col.key === "year"
                  ? YEAR_WIDTH
                  : col.key === "month"
                    ? MONTH_WIDTH
                    : undefined;

              return (
                <TableCell
                  key={col.key}
                  className={classes?.tableHeader}
                  align={col.align}
                  sx={{
                    position: isSticky ? "sticky" : "static",
                    left,
                    width,
                    minWidth: width,
                    maxWidth: width,
                    backgroundColor: "#faf9f6",
                    zIndex: isSticky ? 3 : 1,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    borderRight: "1px solid #c3c3c3",
                  }}
                >
                  {col.label}
                </TableCell>
              );
            })}

            {METRIC_COLS.map((col) => (
              <TableCell
                key={col.key}
                className={classes?.tableHeader}
                align={col.align}
                sx={{
                  backgroundColor: "#faf9f6",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  ...(col.numeric && { fontVariantNumeric: "tabular-nums" }),
                  borderRight: "1px solid #c3c3c3",
                }}
              >
                {col.label}
              </TableCell>
            ))}

            {ROAS_COLS.map((col, idx) => (
              <TableCell
                key={col.key}
                className={classes?.tableHeader}
                align={col.align}
                sx={{
                  backgroundColor: "#faf9f6",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  ...(col.numeric && { fontVariantNumeric: "tabular-nums" }),
                  borderRight:
                    idx < ROAS_COLS.length - 1
                      ? "1px solid #c3c3c3"
                      : undefined,
                }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody className={classes?.spacedBody}>
          {loading ? (
            Array.from({ length: 8 }).map((_, r) => (
              <TableRow key={`sk-${r}`} className={classes?.tableRow}>
                {ALL_COLS.map((col, idx) => (
                  <TableCell
                    key={`${col.key}-${idx}`}
                    align={col.align || "left"}
                    sx={{
                      py: 0,
                      borderRight:
                        idx < ALL_COLS.length - 1
                          ? "1px solid #e0e0e0"
                          : undefined,
                    }}
                  >
                    <Skeleton width="100%" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (visibleRows?.length ?? 0) === 0 ? (
            <TableRow>
              <TableCell
                colSpan={ALL_COLS.length}
                align="center"
                sx={{ py: 6, color: "text.secondary" }}
              >
                No data
              </TableCell>
            </TableRow>
          ) : (
            (showFull ? visibleRows : visibleRows).map((row) => {
              const rowKey = `${row.app_name ?? "app"}-${row.os ?? "os"}-${
                row.year ?? "y"
              }-${row.month ?? "m"}`;

              return (
                <TableRow key={rowKey} className={classes?.tableRow}>
                  {/* Core */}
                  {CORE_COLS.map((col) => {
                    const raw = row[col.key];
                    const val = renderValue(col, raw);
                    const isZero = isZeroish(val);

                    const isSticky = col.key === "year" || col.key === "month";
                    const left = STICKY_OFFSETS[col.key] ?? undefined;
                    const width =
                      col.key === "year"
                        ? YEAR_WIDTH
                        : col.key === "month"
                          ? MONTH_WIDTH
                          : undefined;

                    const Comp =
                      col.key === "month" ? TableCellDate : TableCell;

                    return (
                      <Comp
                        key={col.key}
                        align={col.align}
                        className={`${classes.tableCellM} ${isZero ? classes.zeroValue : ""}`}
                        sx={{
                          position: isSticky ? "sticky" : "static",
                          left,
                          width,
                          minWidth: width,
                          maxWidth: width,
                          backgroundColor: isSticky
                            ? "background.paper"
                            : undefined,
                          zIndex: isSticky ? 1 : 0,
                          py: 0,
                          whiteSpace: "nowrap",
                          borderRight: "1px solid #eee",
                          ...(col.numeric && {
                            fontVariantNumeric: "tabular-nums",
                          }),
                        }}
                      >
                        {val}
                      </Comp>
                    );
                  })}

                  {/* Metrics */}
                  {METRIC_COLS.map((col) => {
                    const raw = row[col.key];
                    const val = renderValue(col, raw);
                    return (
                      <TableCell
                        key={col.key}
                        align={col.align}
                        className={`${classes.tableCellM1} ${isZeroish(val) ? classes.zeroValue : ""}`}
                        sx={{
                          py: 0,
                          whiteSpace: "nowrap",
                          borderRight: "1px solid #c3c3c3",
                          ...(col.numeric && {
                            fontVariantNumeric: "tabular-nums",
                          }),
                        }}
                      >
                        {val}
                      </TableCell>
                    );
                  })}

                  {/* ROAS */}
                  {ROAS_COLS.map((col) => {
                    const raw = row[col.key];
                    const val = renderValue(col, raw);
                    return (
                      <TableCell
                        key={col.key}
                        align={col.align}
                        className={`${classes.tableCellM1} ${isZeroish(val) ? classes.zeroValue : ""}`}
                        sx={[
                          {
                            py: 0,
                            whiteSpace: "nowrap",
                            borderRight: "1px solid #c3c3c3",
                            ...(col.numeric && {
                              fontVariantNumeric: "tabular-nums",
                            }),
                          },
                        ]}
                      >
                        {val}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
