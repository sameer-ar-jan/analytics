import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createRemoteJWKSet } from "jose";
import { verifyGoogleIdentity } from "./google-identity";
import { SESSION_COOKIE, verifySessionToken } from "./session-token";

const googleKeys = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
export const NONCE_COOKIE = "analytics_login_nonce";

export function allowedEmails() {
  return new Set((process.env.ALLOWED_EMAILS || "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean));
}

export async function getSession() {
  const secret = process.env.SESSION_SECRET;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!secret || !token) return null;
  const user = await verifySessionToken(token, secret);
  return user && allowedEmails().has(user.email.toLowerCase()) ? user : null;
}

export async function requireSession() {
  const user = await getSession();
  if (!user) redirect("/login");
  return user;
}

export async function verifyGoogleCredential(credential: string, nonce: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("Google sign-in is not configured.");
  return verifyGoogleIdentity(credential, nonce, clientId, allowedEmails(), googleKeys);
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return origin === new URL(request.url).origin;
}
