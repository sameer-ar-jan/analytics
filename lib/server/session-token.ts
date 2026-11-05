import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "analytics_session";
export const SESSION_SECONDS = 8 * 60 * 60;
const ISSUER = "app-analytics";
const AUDIENCE = "analytics-web";

export type SessionUser = { sub: string; email: string; name: string };

function key(secret: string) {
  if (secret.length < 32) throw new Error("SESSION_SECRET must contain at least 32 characters.");
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser, secret: string) {
  return new SignJWT({ email: user.email, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.sub)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_SECONDS}s`)
    .sign(key(secret));
}

export async function verifySessionToken(token: string, secret: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, key(secret), {
      algorithms: ["HS256"], issuer: ISSUER, audience: AUDIENCE,
    });
    if (!payload.sub || typeof payload.email !== "string" || typeof payload.name !== "string") return null;
    return { sub: payload.sub, email: payload.email, name: payload.name };
  } catch {
    return null;
  }
}
