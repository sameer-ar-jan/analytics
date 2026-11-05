import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { NONCE_COOKIE } from "@/lib/server/auth";

export async function GET() {
  const nonce = randomBytes(32).toString("base64url");
  const response = NextResponse.json(
    { nonce },
    { headers: { "Cache-Control": "no-store" } },
  );
  response.cookies.set(NONCE_COOKIE, nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return response;
}
