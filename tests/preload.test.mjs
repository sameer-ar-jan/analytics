import test from "node:test";
import assert from "node:assert/strict";
import { buildAnalyticsPreloadPaths } from "../features/analytics/api/preload.js";
import {
  clearGetResponseCache,
  getCachedResponse,
  seedGetResponseCache,
} from "../features/analytics/api/axios.js";

test("preload plan covers selected Dashboard data and shared report defaults", () => {
  const paths = buildAnalyticsPreloadPaths({
    query: "US A",
    game: "2248",
    now: new Date(2026, 10, 10, 12),
  });

  assert.ok(paths.includes("stackoverflow/US A/2248"));
  assert.ok(paths.includes("month/US AMA/2248"));
  assert.ok(paths.includes("stackoverflow/AI"));
  assert.ok(paths.includes("month/AIMA"));
  assert.ok(paths.includes("month/values"));
  assert.ok(paths.includes("month/spendAdjustment"));
});

test("preload plan warms each game report family without duplicate requests", () => {
  const paths = buildAnalyticsPreloadPaths({
    now: new Date(2026, 10, 10, 12),
  });

  assert.ok(paths.includes("stackoverflow/AI/x2"));
  assert.ok(paths.includes("month/AIMA/x2"));
  assert.ok(paths.includes("stackoverflow/AI"));
  assert.ok(paths.includes("ret_roas/AI/x2"));
  assert.ok(paths.includes("ret_roas/AI/x2/2026-10-11/2026-11-09/-/-"));
  assert.ok(paths.includes("roas_2y/I/2248"));
  assert.ok(paths.includes("roas_2y/I/MergeHexa"));
  assert.equal(new Set(paths).size, paths.length);
});

test("server-rendered report data can seed the client response cache", () => {
  const rows = [{ Install_time: { value: "2026-11-09" } }];
  clearGetResponseCache();
  seedGetResponseCache("stackoverflow/AI/x2", rows);
  assert.deepEqual(getCachedResponse("stackoverflow/AI/x2"), rows);
  clearGetResponseCache();
});
