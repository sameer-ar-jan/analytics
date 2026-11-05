import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/server/auth";
import { SESSION_COOKIE } from "@/lib/server/session-token";

export async function POST(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  const response = NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } },
  );
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
