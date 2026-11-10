import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";
import { browserSmoke } from "./browser-helper.mjs";
import { createSessionToken } from "../lib/server/session-token.ts";

// Run against a production build with isolated credentials and a local upstream.
test(
  "native routes, session protection, and server analytics adapter",
  { timeout: 150_000 },
  async (t) => {
    const upstreamRequests = [];
    const dailyRows = Array.from({ length: 5 }, (_, index) => {
      const day = new Date();
      day.setDate(day.getDate() - index - 2);
      return {
        Install_time: { value: day.toISOString().slice(0, 10) },
        game: "x2",
        total_users: 100 + index * 10,
        DAU: 400 + index * 20,
        Ad_Rev: 200 + index * 15,
        total_spend: 150 + index * 5,
        Facebook_cost: 150 + index * 5,
      };
    });
    const eventRows = dailyRows.flatMap((row, index) =>
      ["A", "Baseline"].map((experimentVariant) => ({
        date: row.Install_time.value,
        exp_no: "firebase_exp_55",
        experimentVariant,
        INT_count: 100 + index,
        RV_count: 80 + index,
        OOM_count: index,
        BOR_count: 20 + index,
        purchase_count: 10 + index,
        ad_impression_count: 200 + index,
      })),
    );
    const upstream = createServer((req, res) => {
      upstreamRequests.push(req.url);
      if (req.url === "/month/failure") {
        res.writeHead(503);
        res.end();
        return;
      }
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify(
          req.url === "/month/test"
            ? [{ value: 42 }]
            : req.url.startsWith("/stackoverflow/")
              ? dailyRows
              : /^\/eventsGraph\/(x2blocks|2248)\//.test(req.url)
                ? eventRows
                : [],
        ),
      );
    }).listen(0, "127.0.0.1");
    await once(upstream, "listening");
    const portProbe = createServer().listen(0, "127.0.0.1");
    await once(portProbe, "listening");
    const port = portProbe.address().port;
    await new Promise((resolve) => portProbe.close(resolve));
    const base = `http://localhost:${port}`;
    const secret = "integration-only-secret-thirty-two-characters-minimum";
    const child = spawn(
      process.execPath,
      ["node_modules/next/dist/bin/next", "start", "--port", String(port)],
      {
        env: {
          ...process.env,
          SESSION_SECRET: secret,
          ALLOWED_EMAILS: "analyst@example.com",
          GOOGLE_CLIENT_ID: "test.apps.googleusercontent.com",
          ANALYTICS_API_URL: `http://127.0.0.1:${upstream.address().port}`,
        },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    let output = "";
    child.stdout.on("data", (data) => {
      output += data;
    });
    child.stderr.on("data", (data) => {
      output += data;
    });
    t.after(async () => {
      child.kill("SIGTERM");
      await new Promise((resolve) => upstream.close(resolve));
    });
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      if (child.exitCode !== null) throw new Error(output);
      try {
        await fetch(`${base}/api/auth/session`);
        ready = true;
        break;
      } catch {
        await delay(100);
      }
    }
    assert.ok(ready, output);
    const get = (path, headers = {}) =>
      fetch(`${base}${path}`, { headers, redirect: "manual" });
    const root = await get("/");
    assert.equal(root.status, 307);
    assert.equal(root.headers.get("location"), "/dashboard");
    for (const path of [
      "/dashboard",
      "/overall",
      "/campwise",
      "/roas2y",
      "/dashboardbuilder",
    ]) {
      const response = await get(path);
      // Streaming can encode a redirect in HTML instead of the HTTP status.
      const body = await response.text();
      assert.ok(
        response.headers.get("location") === "/login" ||
          (body.includes("NEXT_REDIRECT") && body.includes("/login")),
        path,
      );
    }
    assert.equal((await get("/api/analytics/month/test")).status, 401);
    assert.equal((await get("/api/auth/session")).status, 401);
    assert.equal(
      upstreamRequests.length,
      0,
      "unauthorized reports must not query upstream",
    );
    const challenge = await get("/api/auth/challenge");
    assert.ok((await challenge.json()).nonce.length > 20);
    assert.match(challenge.headers.get("set-cookie"), /HttpOnly/i);
    const crossOrigin = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: {
        Origin: "https://attacker.example",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ credential: "fake" }),
    });
    assert.equal(crossOrigin.status, 403);
    const missingChallenge = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { Origin: base, "Content-Type": "application/json" },
      body: JSON.stringify({ credential: "fake" }),
    });
    assert.equal(missingChallenge.status, 400);
    const invalidGoogle = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: {
        Origin: base,
        "Content-Type": "application/json",
        Cookie: "analytics_login_nonce=test-nonce",
      },
      body: JSON.stringify({ credential: "not-a-google-token" }),
    });
    assert.equal(invalidGoogle.status, 401);
    const token = await createSessionToken(
      { sub: "test-sub", email: "analyst@example.com", name: "Analyst" },
      secret,
    );
    const headers = { Cookie: `analytics_session=${token}` };
    const requestsBeforeBuilder = upstreamRequests.length;
    const builder = await get("/dashboardbuilder", headers);
    const builderBody = await builder.text();
    assert.equal(builder.status, 200);
    assert.ok(builderBody.includes("Dashboard Builder"));
    assert.ok(builderBody.includes("Arrange report metrics"));
    assert.ok(
      !builderBody.includes('"digest":"') &&
        !builderBody.includes("NEXT_REDIRECT"),
    );
    assert.equal(
      upstreamRequests.length,
      requestsBeforeBuilder,
      "builder must not fetch unrelated reports",
    );
    const legacyBuilder = await get("/DashboardBuilder");
    const legacyBuilderBody = await legacyBuilder.text();
    assert.ok(
      legacyBuilder.headers.get("location") === "/dashboardbuilder" ||
        (legacyBuilderBody.includes("NEXT_REDIRECT") &&
          legacyBuilderBody.includes("/dashboardbuilder")),
    );
    assert.equal((await get("/api/auth/session", headers)).status, 200);
    const analytics = await get("/api/analytics/month/test", headers);
    assert.equal(analytics.status, 200);
    assert.deepEqual(await analytics.json(), [{ value: 42 }]);
    assert.match(analytics.headers.get("cache-control"), /no-store/);
    assert.equal(
      (await get("/api/analytics/unknown/test", headers)).status,
      400,
    );
    assert.equal(
      (await get("/api/analytics/month/failure", headers)).status,
      502,
    );
    const tampered = {
      Cookie: `analytics_session=${token.slice(0, -8)}tampered`,
    };
    assert.equal(
      (await get("/api/analytics/month/test", tampered)).status,
      401,
    );
    const requestsBeforeClientReports = upstreamRequests.length;
    for (const path of [
      "/dashboard",
      "/dashboard?q=AI&game=2248",
      "/overall",
      "/campwise",
      "/roas2y",
    ]) {
      const response = await get(path, headers);
      const body = await response.text();
      assert.equal(response.status, 200, path);
      assert.ok(
        !body.includes('"digest":"') && !body.includes("NEXT_REDIRECT"),
        `${path}: server render failed\n${output}`,
      );
      assert.ok(
        body.includes("Download") || body.includes("Select Game"),
        `${path}: report HTML missing`,
      );
    }
    assert.equal(
      upstreamRequests.length,
      requestsBeforeClientReports,
      "report navigation should not block on server-side API refetches",
    );
    for (const [legacy, canonical] of [
      ["/Overall", "/overall"],
      ["/CampWise", "/campwise"],
    ]) {
      const response = await get(`${legacy}?q=AI`);
      const body = await response.text();
      assert.ok(
        response.headers.get("location") === `${canonical}?q=AI` ||
          (body.includes("NEXT_REDIRECT") &&
            body.includes(`${canonical}?q=AI`)),
        legacy,
      );
    }
    if (process.env.CHROME_PATH) {
      await browserSmoke({
        base,
        token,
        chromePath: process.env.CHROME_PATH,
        screenshotPath: process.env.BROWSER_SCREENSHOT,
      });
    }
    const logout = await fetch(`${base}/api/auth/logout`, {
      method: "POST",
      headers: { ...headers, Origin: base },
    });
    assert.equal(logout.status, 200);
    assert.match(logout.headers.get("set-cookie"), /analytics_session=;/);
  },
);
