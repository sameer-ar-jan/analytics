import moment from "moment";
import { getReportDay } from "./chartDates.js";

const METRICS = {
  INT: "INT_count",
  RV: "RV_count",
  OOM: "OOM_count",
  BOR: "BOR_count",
  purchase: "purchase_count",
  AdImpression: "ad_impression_count",
};
const rowsOf = (rows) => (Array.isArray(rows) ? rows : []);
const namesOf = (rows, field) =>
  [
    ...new Set(
      rows
        .map((row) => row?.[field])
        .filter((value) => value != null && value !== "")
        .map(String),
    ),
  ].sort();

export function buildEventChartData({
  data,
  dataGeo,
  dataGeolist,
  itemGeo,
  itemExp,
  start,
  end,
}) {
  const geoRows = rowsOf(dataGeo);
  const geo = [
    "All Geo",
    ...namesOf([...rowsOf(dataGeolist), ...geoRows], "geo"),
  ];
  const selectedGeo = geo.includes(String(itemGeo))
    ? String(itemGeo)
    : "All Geo";
  // The aggregate report has its own experiments; a geo request may be empty,
  // pending, or contain a different set of experiments.
  const source =
    selectedGeo === "All Geo"
      ? rowsOf(data)
      : geoRows.filter((row) => String(row.geo) === selectedGeo);
  const experiments = namesOf(source, "exp_no");
  const selectedExperiment = experiments.includes(String(itemExp))
    ? String(itemExp)
    : experiments[0] || "";
  const graphdata = Object.fromEntries(
    Object.keys(METRICS).map((key) => [key, []]),
  );

  source.forEach((row) => {
    const date = getReportDay(row.date);
    if (
      date === null ||
      String(row.exp_no) !== selectedExperiment ||
      !moment(date).isBetween(start, end, "day", "[]")
    )
      return;
    Object.entries(METRICS).forEach(([key, field]) => {
      const raw = row[field];
      if (raw == null || raw === "" || !Number.isFinite(Number(raw))) return;
      graphdata[key].push({
        date,
        value: Number(raw),
        category: String(row.experimentVariant ?? "Value"),
      });
    });
  });
  Object.values(graphdata).forEach((rows) =>
    rows.sort((a, b) => a.date - b.date),
  );
  return { geo, experiments, selectedGeo, selectedExperiment, graphdata };
}
