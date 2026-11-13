// Components/QuestionsTableCampWise/QuestionsTableCampWise.jsx
import * as React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Skeleton from "@mui/material/Skeleton";
import { styled } from "@mui/system";
import classes from "./QuestionsTable.module.css"; // keep your CSS module

const TableCellEllipsis = styled(TableCell)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// ----- helpers -----
const fmtInt = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n).toLocaleString() : "0";
};
const fmt1 = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(1) : "0.0";
};
const renderValue = (col, raw) => {
  if (col.fmt) return col.fmt(raw);
  if (col.numeric) {
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  }
  if (raw === "NaN") return "0";
  return raw ?? "";
};
const isZeroish = (val) => {
  if (val === null || val === undefined) return false;
  const s = String(val).trim();
  if (s === "") return false;
  const normalized = s.replace(/[, ]/g, "").replace(/%$/, "");
  const n = Number(normalized);
  return Number.isFinite(n) && n === 0;
};

// ----- base column groups -----
const INFO_COLS_BASE = [
  { key: "date", label: "Date", align: "left" },
  { key: "campaign", label: "Campaign", align: "left" },
  { key: "network", label: "Network", align: "left" },
  { key: "geo", label: "Geo", align: "left" },
];

const SPEND_USER_COLS = [
  { key: "cost", label: "Cost", align: "right", fmt: fmtInt, numeric: true },
  { key: "users", label: "Users", align: "right", numeric: true },
];

const ROAS_COLS = [
  {
    key: "roas_d0",
    label: "ROAS D0",
    align: "right",
    fmt: fmt1,
    numeric: true,
  },
  {
    key: "roas_d7",
    label: "ROAS D7",
    align: "right",
    fmt: fmt1,
    numeric: true,
  },
  {
    key: "roas_d14",
    label: "ROAS D14",
    align: "right",
    fmt: fmt1,
    numeric: true,
  },
  {
    key: "roas_d28",
    label: "ROAS D28",
    align: "right",
    fmt: fmt1,
    numeric: true,
  },
];

const RET_COLS = [
  {
    key: "retention_d1",
    label: "Retention D1",
    align: "right",
    fmt: fmt1,
    numeric: true,
  },
  {
    key: "retention_d7",
    label: "Retention D7",
    align: "right",
    fmt: fmt1,
    numeric: true,
  },
  {
    key: "retention_d14",
    label: "Retention D14",
    align: "right",
    fmt: fmt1,
    numeric: true,
  },
  {
    key: "retention_d30",
    label: "Retention D30",
    align: "right",
    fmt: fmt1,
    numeric: true,
  },
];

// style for non-info columns (grey bg + black text)
const NON_INFO_HEADER_SX = { backgroundColor: "#f0f0f0", color: "#000" };
const NON_INFO_BODY_SX = { backgroundColor: "#f0f0f0", color: "#000" };

// widths for info columns (used to compute sticky offsets dynamically)
const BASE_WIDTHS = { date: 140, campaign: 260, network: 160, geo: 120 };

export default function CampWiseTable({
  rows = [],
  loading = false,
  showDateCol = true,
  showGeoCol = true,
}) {
  // Build visible INFO_COLS based on toggles (keep order)
  const INFO_COLS = React.useMemo(() => {
    return INFO_COLS_BASE.filter((c) => {
      if (c.key === "date" && !showDateCol) return false;
      if (c.key === "geo" && !showGeoCol) return false;
      return true;
    });
  }, [showDateCol, showGeoCol]);

  const ALL_COLS = React.useMemo(
    () => [...INFO_COLS, ...SPEND_USER_COLS, ...ROAS_COLS, ...RET_COLS],
    [INFO_COLS],
  );

  // Build widths and sticky left offsets for the *visible* info columns
  const COL_WIDTHS = React.useMemo(() => {
    const w = {};
    for (const c of INFO_COLS) w[c.key] = BASE_WIDTHS[c.key];
    return w;
  }, [INFO_COLS]);

  const STICKY_OFFSETS = React.useMemo(() => {
    let left = 0;
    const offsets = {};
    for (const c of INFO_COLS) {
      offsets[c.key] = left;
      left += COL_WIDTHS[c.key] || 0;
    }
    return offsets;
  }, [INFO_COLS, COL_WIDTHS]);

  // index for right borders
  const COL_INDEX = React.useMemo(
    () => ALL_COLS.reduce((acc, c, i) => ((acc[c.key] = i), acc), {}),
    [ALL_COLS],
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
        mb: 6,
        pb: 2,
      }}
    >
      <Table
        stickyHeader
        size="small"
        aria-label="campaign metrics table"
        sx={{
          minWidth: Math.max(1200, ALL_COLS.length * 120),
          borderSpacing: 0,
        }}
      >
        <TableHead
          sx={{ position: "sticky", top: -50, zIndex: 2 }}
          className={classes?.Thead}
        >
          {/* Group row */}
          <TableRow
            className={classes?.tableRow}
            sx={{ height: "3rem !important" }}
          >
            <TableCell
              className={classes?.group1}
              align="left"
              colSpan={INFO_COLS.length}
              sx={{
                backgroundColor: "#faf9f6",
                fontWeight: 600,
                whiteSpace: "nowrap",
                borderRight: "1px solid #c3c3c3",
              }}
            >
              Info
            </TableCell>
            <TableCell
              className={classes?.group2}
              align="center"
              colSpan={SPEND_USER_COLS.length}
              sx={{
                ...NON_INFO_HEADER_SX,
                fontWeight: 600,
                borderRight: "1px solid #c3c3c3 !important",
              }}
            >
              Spend & Users
            </TableCell>
            <TableCell
              className={classes?.group2}
              align="center"
              colSpan={ROAS_COLS.length}
              sx={{ ...NON_INFO_HEADER_SX, fontWeight: 600 }}
            >
              ROAS
            </TableCell>
            <TableCell
              className={classes?.group2}
              align="center"
              colSpan={RET_COLS.length}
              sx={{ ...NON_INFO_HEADER_SX, fontWeight: 600 }}
            >
              Retention
            </TableCell>
          </TableRow>

          {/* Labels row */}
          <TableRow
            className={classes?.tableRow}
            sx={{ height: "3rem !important" }}
          >
            {ALL_COLS?.map((col) => {
              const idx = COL_INDEX[col.key];
              const isInfo = INFO_COLS.some((c) => c.key === col.key);
              const isSticky = isInfo;
              const left = STICKY_OFFSETS[col.key] ?? undefined;
              const width = COL_WIDTHS[col.key] ?? undefined;
              const Comp = isInfo ? TableCellEllipsis : TableCell;

              return (
                <Comp
                  key={col.key}
                  className={classes?.tableHeader}
                  align={col.align}
                  sx={{
                    position: isSticky ? "sticky" : "static",
                    left,
                    width,
                    minWidth: width,
                    maxWidth: width,
                    backgroundColor: isInfo
                      ? "#faf9f6"
                      : NON_INFO_HEADER_SX.backgroundColor,
                    color: isInfo ? undefined : NON_INFO_HEADER_SX.color,
                    zIndex: isSticky ? 3 : 1,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    borderRight:
                      idx < ALL_COLS.length - 1
                        ? "1px solid #c3c3c3"
                        : undefined,
                    ...(col.numeric && { fontVariantNumeric: "tabular-nums" }),
                  }}
                >
                  {col.label}
                </Comp>
              );
            })}
          </TableRow>
        </TableHead>

        <TableBody className={classes?.spacedBody}>
          {loading ? (
            Array.from({ length: 8 })?.map((_, r) => (
              <TableRow key={`sk-${r}`} className={classes?.tableRow}>
                {ALL_COLS?.map((col) => {
                  const idx = COL_INDEX[col.key];
                  const isInfo = INFO_COLS.some((c) => c.key === col.key);
                  return (
                    <TableCell
                      key={`${col.key}-${r}`}
                      align={col.align || "left"}
                      sx={{
                        py: 0,
                        backgroundColor: isInfo
                          ? undefined
                          : NON_INFO_BODY_SX.backgroundColor,
                        color: isInfo ? undefined : NON_INFO_BODY_SX.color,
                        borderRight:
                          idx < ALL_COLS.length - 1
                            ? "1px solid #eee"
                            : undefined,
                      }}
                    >
                      <Skeleton width="100%" />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : rows.length === 0 ? (
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
            rows?.map((row) => (
              <TableRow
                key={
                  row.id ??
                  `${row.campaign ?? "cmp"}-${row.date ?? "d"}-${
                    row.network ?? "nw"
                  }-${row.geo ?? "g"}`
                }
                className={classes?.tableRow}
              >
                {ALL_COLS?.map((col) => {
                  const raw = row[col.key];
                  const val = renderValue(col, raw);
                  const idx = COL_INDEX[col.key];
                  const isInfo = INFO_COLS.some((c) => c.key === col.key);
                  const isSticky = isInfo;
                  const left = STICKY_OFFSETS[col.key] ?? undefined;
                  const width = COL_WIDTHS[col.key] ?? undefined;
                  const Comp = isInfo ? TableCellEllipsis : TableCell;

                  return (
                    <Comp
                      key={col.key}
                      align={col.align}
                      className={`${classes.tableCellM1} ${isZeroish(val) ? classes.zeroValue : ""}`}
                      sx={[
                        {
                          position: isSticky ? "sticky" : "static",
                          left,
                          width,
                          minWidth: width,
                          maxWidth: width,
                          backgroundColor: isInfo
                            ? "background.paper"
                            : NON_INFO_BODY_SX.backgroundColor,
                          color: isInfo ? undefined : NON_INFO_BODY_SX.color,
                          zIndex: isSticky ? 1 : 0,
                          py: 0,
                          whiteSpace: "nowrap",
                          borderRight:
                            idx < ALL_COLS.length - 1
                              ? "1px solid #c3c3c3"
                              : undefined,
                          ...(col.numeric && {
                            fontVariantNumeric: "tabular-nums",
                          }),
                        },
                      ]}
                    >
                      {val}
                    </Comp>
                  );
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
