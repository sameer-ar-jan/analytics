import test from "node:test";
import assert from "node:assert/strict";
import { loadGameWiseRows } from "../features/analytics/Pages/Overall/gamewise-data.js";

const games = [
  { id: "2248", name: "2248" },
  { id: "sandblast", name: "SandBlast" },
  { id: "x2", name: "x2 Blocks" },
];

test("loads each game in parallel once and preserves the shared metric rows", async () => {
  const calls = [];
  const pending = new Map();
  const metricRows = games.map((game, index) => [{
    Install_time: { value: "2026-10-27" },
    total_users: 100 + index,
    DAU: 1000 + index,
    Ad_Rev: 200 + index,
    total_spend: 50 + index,
  }]);
  const resultPromise = loadGameWiseRows(games, "RI", (url) => {
    calls.push(url);
    return new Promise((resolve) => pending.set(url, resolve));
  });

  // Every request starts before any response is delivered.
  assert.deepEqual(calls, games.map((game) => `stackoverflow/RI/${game.id}`));
  let settled = false;
  resultPromise.then(() => { settled = true; });
  pending.get(calls[2])({ data: metricRows[2] });
  await Promise.resolve();
  assert.equal(settled, false, "the batch should await all games");
  pending.get(calls[0])({ data: metricRows[0] });
  pending.get(calls[1])({ data: metricRows[1] });

  const result = await resultPromise;
  assert.equal(result.error, "");
  assert.equal(calls.length, games.length, "both popup metrics share one raw response per game");
  for (const [index, game] of games.entries()) {
    assert.strictEqual(result.rows[game.id].rows, metricRows[index]);
    assert.equal(result.rows[game.id].error, "");
  }
});

test("isolates failed games while preserving successful responses", async () => {
  const goodRows = [{ total_users: 31, DAU: 415, Ad_Rev: 22, total_spend: 9 }];
  const result = await loadGameWiseRows(games, "AI", (url) => {
    if (url.endsWith("/sandblast")) return Promise.reject(new Error("upstream failed"));
    if (url.endsWith("/x2")) throw new Error("request setup failed");
    return Promise.resolve({ data: goodRows });
  });

  assert.strictEqual(result.rows["2248"].rows, goodRows);
  assert.equal(result.rows["2248"].error, "");
  for (const id of ["sandblast", "x2"]) {
    assert.deepEqual(result.rows[id].rows, []);
    assert.match(result.rows[id].error, /unable to load/i);
  }
  assert.match(result.error, /some game wise data could not be loaded/i);
});

test("normalizes non-array response bodies to empty data", async () => {
  const bodies = [null, { unexpected: true }, "unexpected"];
  const result = await loadGameWiseRows(games, "AI", (url) => {
    const index = games.findIndex((game) => url.endsWith(`/${game.id}`));
    return Promise.resolve({ data: bodies[index] });
  });

  for (const game of games) assert.deepEqual(result.rows[game.id], { rows: [], error: "" });
  assert.equal(result.error, "");
});

test("uses the AI query when no query is provided", async () => {
  for (const query of [undefined, null, ""]) {
    const calls = [];
    const result = await loadGameWiseRows(games, query, async (url) => {
      calls.push(url);
      return { data: [] };
    });
    assert.deepEqual(calls, games.map((game) => `stackoverflow/AI/${game.id}`));
    assert.equal(result.error, "");
  }
});
