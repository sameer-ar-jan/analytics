import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyPair, SignJWT, exportJWK, createLocalJWKSet } from "jose";
import { verifyGoogleIdentity } from "../lib/server/google-identity.ts";

const { privateKey, publicKey } = await generateKeyPair("RS256");
const publicJwk = await exportJWK(publicKey);
const keys = createLocalJWKSet({ keys: [{ ...publicJwk, kid: "test-google-key", alg: "RS256" }] });
const clientId = "test.apps.googleusercontent.com";
const emails = new Set(["analyst@example.com"]);
async function token(overrides = {}, audience = clientId, expiry = "1h") {
  return new SignJWT({ email: "analyst@example.com", email_verified: true, nonce: "expected-nonce", name: "Analyst", ...overrides })
    .setProtectedHeader({ alg: "RS256", kid: "test-google-key" })
    .setSubject("google-sub").setIssuer("https://accounts.google.com").setAudience(audience)
    .setIssuedAt().setExpirationTime(expiry).sign(privateKey);
}
const verify = (credential) => verifyGoogleIdentity(credential, "expected-nonce", clientId, emails, keys);

test("Google identity is accepted only with a valid signature and authorized verified account", async () => {
  assert.deepEqual(await verify(await token()), { sub: "google-sub", email: "analyst@example.com", name: "Analyst" });
});

test("wrong Google audience, expired credential, nonce replay, unverified and unauthorized emails fail", async () => {
  for (const credential of [
    await token({}, "another-client"), await token({}, clientId, "-1h"),
    await token({ nonce: "different-browser-nonce" }), await token({ email_verified: false }),
    await token({ email: "outsider@example.com" }),
  ]) await assert.rejects(verify(credential));
});

test("forged Google signatures are rejected", async () => {
  const credential = await token();
  await assert.rejects(verify(`${credential.slice(0, -8)}tampered`));
});
