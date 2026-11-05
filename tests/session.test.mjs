import test from "node:test";
import assert from "node:assert/strict";
import { SignJWT } from "jose";
import { createSessionToken, verifySessionToken } from "../lib/server/session-token.ts";

const secret = "test-secret-with-at-least-thirty-two-characters";
const user = { sub: "google-user-123", email: "analyst@example.com", name: "Analyst" };

test("session round trip preserves only the user identity", async () => {
  const token = await createSessionToken(user, secret);
  assert.deepEqual(await verifySessionToken(token, secret), user);
});

test("tampered and incorrectly signed sessions are rejected", async () => {
  const token = await createSessionToken(user, secret);
  assert.equal(await verifySessionToken(`${token.slice(0, -8)}tampered`, secret), null);
  assert.equal(await verifySessionToken(token, `${secret}-different`), null);
  assert.equal(await verifySessionToken("not-a-token", secret), null);
});

test("expired sessions and incorrect audiences are rejected", async () => {
  for (const [audience, expiry] of [["analytics-web", "-1h"], ["another-app", "1h"]]) {
    const token = await new SignJWT({ email: user.email, name: user.name })
      .setProtectedHeader({ alg: "HS256" }).setSubject(user.sub)
      .setIssuer("app-analytics").setAudience(audience).setIssuedAt().setExpirationTime(expiry)
      .sign(new TextEncoder().encode(secret));
    assert.equal(await verifySessionToken(token, secret), null);
  }
});

test("short session signing secrets fail closed", async () => {
  await assert.rejects(createSessionToken(user, "short"));
});
