import moment from "moment";

// Daily report endpoints return either a date string or a BigQuery date wrapper.
// Normalize before filtering as well as plotting; moment({ value: date })
// otherwise resolves to today and silently excludes historical report rows.
export const getReportDay = (value) => {
  const raw = value?.value ?? value;
  if (raw == null || raw === "") return null;
  if (
    typeof raw !== "string" &&
    typeof raw !== "number" &&
    !(raw instanceof Date) &&
    !moment.isMoment(raw)
  )
    return null;
  const date = moment(raw);
  return date.isValid() ? date.startOf("day").valueOf() : null;
};

// Keep full dates in chart data. Short labels belong on axes, never in x values:
// otherwise 20 May in different years becomes the same categorical position.
export const resolveChartDate = (value, range) => {
  if (value instanceof Date || moment.isMoment(value)) {
    return Number.isFinite(value.valueOf()) ? value.valueOf() : null;
  }
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;

  const fullDate = moment(value, moment.ISO_8601, true);
  if (fullDate.isValid()) return fullDate.valueOf();
  if (!range?.start || !range?.end) return value;

  // Compatibility for older single-year callers that still supply DD MMM.
  // Multi-year producers must supply a full date; a label cannot recover a year.
  const label = moment(`${value} 2000`, "DD MMM YYYY", true);
  if (!label.isValid()) return value;
  const start = moment(range.start).startOf("day");
  const end = moment(range.end).endOf("day");
  for (let year = start.year(); year <= end.year(); year += 1) {
    const candidate = moment(`${value} ${year}`, "DD MMM YYYY", true);
    if (
      candidate.isValid() &&
      candidate.isBetween(start, end, undefined, "[]")
    ) {
      return candidate.valueOf();
    }
  }
  return null;
};

const formatDate = (value, pattern) => {
  // G2 may pass the timestamp as a string when formatting ticks.
  const date =
    typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value;
  return moment(date).format(pattern);
};

export const prepareChartDates = (datasets, range) => {
  let normalized = datasets.map((rows) =>
    (Array.isArray(rows) ? rows : [])
      .filter((row) => row && row.date != null)
      .map((row) => ({ ...row, date: resolveChartDate(row.date, range) }))
      .filter((row) => row.date !== null),
  );

  const start =
    range?.start != null ? moment(range.start).startOf("day") : null;
  const end = range?.end != null ? moment(range.end).endOf("day") : null;
  const hasRange = Boolean(start?.isValid() && end?.isValid() && start <= end);
  const timeAxis =
    hasRange ||
    normalized.some((rows) => rows.some((row) => typeof row.date === "number"));

  let first = hasRange ? start.valueOf() : Infinity;
  let last = hasRange ? end.valueOf() : -Infinity;
  if (timeAxis) {
    normalized = normalized.map((rows) =>
      rows
        .filter((row) => typeof row.date === "number")
        .sort((a, b) => a.date - b.date),
    );
    normalized.forEach((rows) =>
      rows.forEach(({ date }) => {
        first = Math.min(first, date);
        last = Math.max(last, date);
      }),
    );
  }
  const spansYears =
    Number.isFinite(first) &&
    Number.isFinite(last) &&
    moment(first).year() !== moment(last).year();
  const labelFormat = spansYears ? "DD MMM YYYY" : "DD MMM";
  const formatter = (value) => formatDate(value, labelFormat);

  return {
    datasets: normalized,
    meta: {
      date: {
        type: timeAxis ? "time" : "cat",
        // Time-scale "nice" ticks can extend the domain again on each dual-axis
        // render. Keep the complete data/selected range as the actual domain.
        ...(timeAxis ? { nice: false } : {}),
        ...(hasRange
          ? {
              min: start.valueOf(),
              max: end.valueOf(),
            }
          : {}),
      },
    },
    xAxis: {
      ...(timeAxis ? { nice: false } : {}),
      label: {
        autoRotate: true,
        autoHide: true,
        ...(timeAxis ? { formatter } : {}),
      },
    },
    slider: { start: 0, end: 1, ...(timeAxis ? { formatter } : {}) },
    tooltip: timeAxis
      ? {
          title: (title, datum) =>
            formatDate(datum?.date ?? title, "DD MMM YYYY"),
        }
      : {},
  };
};
