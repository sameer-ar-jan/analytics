import { jwtVerify, type JWTVerifyGetKey } from "jose";

export async function verifyGoogleIdentity(
  credential: string,
  nonce: string,
  clientId: string,
  emails: Set<string>,
  keys: JWTVerifyGetKey,
) {
  const { payload } = await jwtVerify(credential, keys, {
    algorithms: ["RS256"], audience: clientId,
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    requiredClaims: ["exp", "iat", "sub", "email", "nonce"],
    maxTokenAge: "10m",
  });
  if (payload.nonce !== nonce || payload.email_verified !== true || typeof payload.email !== "string" || !payload.sub) {
    throw new Error("Invalid Google identity.");
  }
  const email = payload.email.toLowerCase();
  if (!emails.has(email)) throw new Error("Account is not authorized.");
  return { sub: payload.sub, email, name: typeof payload.name === "string" ? payload.name : email };
}
