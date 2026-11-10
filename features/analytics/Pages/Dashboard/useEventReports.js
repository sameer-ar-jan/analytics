"use client";

import { useEffect, useState } from "react";
import moment from "moment";
import {
  getCachedOrFetch,
  getCachedResponse,
  hasCachedResponse,
} from "../../api/axios";

// Each response belongs to one game/date/geo selection. Cleanup prevents a slow
// previous selection from replacing the report after navigation.
export default function useEventReports({ game, geo, start, end }) {
  const enabled = game === "2248" || game === "x2";
  const apiGame = game === "x2" ? "x2blocks" : game;
  const from = moment(start).format("YYYY-MM-DD");
  const to = moment(end).format("YYYY-MM-DD");
  const reportKey = `${apiGame}/${from}/${to}`;
  const geoKey = `${reportKey}/${geo}`;
  const [report, setReport] = useState({});
  const [geoReport, setGeoReport] = useState({});

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    const dataUrl = `eventsGraph/${reportKey}`;
    const listUrl = `eventsGraph/geolist/${reportKey}`;
    setReport({
      key: reportKey,
      data: getCachedResponse(dataUrl) ?? null,
      dataGeolist: getCachedResponse(listUrl) ?? null,
      loading: !hasCachedResponse(dataUrl) || !hasCachedResponse(listUrl),
    });
    const load = (url, field) =>
      getCachedOrFetch(url)
        .then((response) => {
          if (active)
            setReport((current) => ({
              ...current,
              [field]: Array.isArray(response.data) ? response.data : [],
            }));
        })
        .catch((error) => {
          console.error("Unable to load event report", error);
          if (active) setReport((current) => ({ ...current, [field]: [] }));
        });
    Promise.all([load(dataUrl, "data"), load(listUrl, "dataGeolist")]).finally(
      () => {
        if (active) setReport((current) => ({ ...current, loading: false }));
      },
    );
    return () => {
      active = false;
    };
  }, [enabled, reportKey]);

  const needsGeo = enabled && Boolean(geo) && geo !== "All Geo";
  useEffect(() => {
    if (!needsGeo) return;
    let active = true;
    const url = `eventsGraph/geo/${encodeURIComponent(geo)}/${reportKey}`;
    setGeoReport({
      key: geoKey,
      data: getCachedResponse(url) ?? null,
      loading: !hasCachedResponse(url),
    });
    getCachedOrFetch(url)
      .then((response) => {
        if (active)
          setGeoReport({
            key: geoKey,
            data: Array.isArray(response.data) ? response.data : [],
            loading: false,
          });
      })
      .catch((error) => {
        console.error("Unable to load geo events", error);
        if (active) setGeoReport({ key: geoKey, data: [], loading: false });
      });
    return () => {
      active = false;
    };
  }, [needsGeo, geo, geoKey, reportKey]);

  return {
    data: enabled && report.key === reportKey ? report.data : null,
    dataGeolist:
      enabled && report.key === reportKey ? report.dataGeolist : null,
    dataGeo: needsGeo && geoReport.key === geoKey ? geoReport.data : null,
    loading:
      enabled &&
      (report.key !== reportKey ||
        report.loading ||
        (needsGeo && (geoReport.key !== geoKey || geoReport.loading))),
  };
}
