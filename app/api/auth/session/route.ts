import { getSession } from "@/lib/server/auth";

export async function GET() {
  const user = await getSession();
  return Response.json(
    { user },
    { status: user ? 200 : 401, headers: { "Cache-Control": "no-store" } },
  );
}
