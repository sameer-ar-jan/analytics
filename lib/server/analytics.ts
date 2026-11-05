import "server-only";

const ENDPOINTS = new Set([
  "stackoverflow",
  "month",
  "eventsGraph",
  "ret_roas",
  "roas_2y",
]);

export function validAnalyticsPath(path: string[]) {
  return (
    path.length > 0 &&
    path.length <= 12 &&
    ENDPOINTS.has(path[0]) &&
    path.every(
      (part) =>
        part.length > 0 &&
        part.length <= 200 &&
        !/[\\/\u0000-\u001f]/.test(part) &&
        part !== "." &&
        part !== "..",
    )
  );
}

// Callers must authorize access before invoking this server-only data adapter.
export async function fetchAnalytics(path: string[]) {
  if (!validAnalyticsPath(path))
    throw new Error("Unsupported analytics endpoint.");
  const base = process.env.ANALYTICS_API_URL;
  if (!base) throw new Error("Analytics API is not configured.");
  const url = new URL(
    `${base.replace(/\/$/, "")}/${path.map(encodeURIComponent).join("/")}`,
  );
  const headers: Record<string, string> = { Accept: "application/json" };
  if (process.env.ANALYTICS_API_TOKEN)
    headers.Authorization = `Bearer ${process.env.ANALYTICS_API_TOKEN}`;
  const response = await fetch(url, {
    headers,
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok)
    throw new Error(`Analytics service returned ${response.status}.`);
  return response.json();
}

export async function loadReport(paths: string[][]) {
  const results = await Promise.allSettled(paths.map(fetchAnalytics));
  return {
    data: results.map((result) =>
      result.status === "fulfilled" ? result.value : [],
    ),
    failed: results.some((result) => result.status === "rejected"),
  };
}
