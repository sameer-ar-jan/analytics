import { NextRequest, NextResponse } from "next/server";
import {
  NONCE_COOKIE,
  sameOrigin,
  verifyGoogleCredential,
} from "@/lib/server/auth";
import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_SECONDS,
} from "@/lib/server/session-token";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  const secret = process.env.SESSION_SECRET;
  if (
    !secret ||
    secret.length < 32 ||
    !process.env.GOOGLE_CLIENT_ID ||
    !process.env.ALLOWED_EMAILS
  ) {
    return NextResponse.json(
      { error: "Sign-in is not configured on the server." },
      { status: 503 },
    );
  }
  try {
    const { credential } = await request.json();
    const nonce = request.cookies.get(NONCE_COOKIE)?.value;
    if (
      !nonce ||
      typeof credential !== "string" ||
      credential.length > 10_000
    ) {
      return NextResponse.json(
        { error: "Please reload and try signing in again." },
        { status: 400 },
      );
    }
    const user = await verifyGoogleCredential(credential, nonce);
    const token = await createSessionToken(user, secret);
    const response = NextResponse.json(
      { user },
      { headers: { "Cache-Control": "no-store" } },
    );
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_SECONDS,
    });
    response.cookies.delete(NONCE_COOKIE);
    return response;
  } catch {
    const response = NextResponse.json(
      {
        error:
          "Sign-in failed. Use an authorized Google account and try again.",
      },
      { status: 401 },
    );
    response.cookies.delete(NONCE_COOKIE);
    return response;
  }
}
