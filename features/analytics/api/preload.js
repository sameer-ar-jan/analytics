import axiosInstance, { hasCachedResponse } from "./axios.js";
import { DASHBOARD_GAMES } from "../Components/DashboardBuilder/dashboard-data.js";

const CAMPAIGN_GAMES = DASHBOARD_GAMES.map(({ id }) => id);
const ROAS_GAMES = [
  "2248",
  "SandBlast",
  "X2",
  "MergeHexa",
  "MTN",
  "DotKnot",
  "Xblock",
];

const formatDate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export function buildAnalyticsPreloadPaths({
  query = "AI",
  game = "x2",
  now = new Date(),
} = {}) {
  const paths = new Set();
  const add = (...parts) => paths.add(parts.join("/"));
  const dailyQuery = query || "AI";
  const monthlyQuery = `${dailyQuery}MA`;

  // Prioritize the selected Dashboard tab and the Overall page's initial data.
  add("stackoverflow", dailyQuery, game);
  add("month", monthlyQuery, game);
  add("stackoverflow", "AI");
  add("month", "AIMA");
  add("month", "values");
  add("month", "spendAdjustment");

  // These rows feed every Dashboard game tab, Dashboard Builder, and the
  // Overall page's game-wise comparison popups.
  for (const { id } of DASHBOARD_GAMES) {
    add("stackoverflow", "AI", id);
    add("month", "AIMA", id);
  }

  // Warm the default Campaign Wise date window and its filter-option data for
  // each game. Other user-selected filters remain on-demand.
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const startDate = formatDate(start);
  const endDate = formatDate(end);
  for (const id of ["2248", "x2blocks"]) {
    const reportKey = `${id}/${startDate}/${endDate}`;
    add("eventsGraph", reportKey);
    add("eventsGraph", "geolist", reportKey);
  }
  for (const id of CAMPAIGN_GAMES) {
    add("ret_roas", "AI", id);
    add("ret_roas", "AI", id, startDate, endDate, "-", "-");
  }

  // ROAS 2-year page uses a separate set of API game identifiers.
  for (const id of ROAS_GAMES) add("roas_2y", "I", id);

  return [...paths];
}

async function warmPaths(paths, concurrency = 6) {
  let nextIndex = 0;
  const workers = Array.from(
    { length: Math.min(concurrency, paths.length) },
    async () => {
      while (nextIndex < paths.length) {
        const path = paths[nextIndex++];
        if (hasCachedResponse(path)) continue;
        try {
          await axiosInstance.get(path);
        } catch {
          // Preloading is opportunistic; the destination page reports its own errors.
        }
      }
    },
  );
  await Promise.all(workers);
}

export function preloadAnalytics(options) {
  const paths = buildAnalyticsPreloadPaths(options);
  let idleHandle;
  let timerHandle;
  const start = () => {
    if (typeof window.requestIdleCallback === "function") {
      idleHandle = window.requestIdleCallback(() => warmPaths(paths), {
        timeout: 1200,
      });
    } else {
      timerHandle = window.setTimeout(() => warmPaths(paths), 0);
    }
  };
  start();

  return () => {
    if (idleHandle != null && typeof window.cancelIdleCallback === "function") {
      window.cancelIdleCallback(idleHandle);
    }
    if (timerHandle != null) window.clearTimeout(timerHandle);
  };
}
