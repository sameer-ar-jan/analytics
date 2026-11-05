import { getSession } from "@/lib/server/auth";
import { fetchAnalytics, validAnalyticsPath } from "@/lib/server/analytics";

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  if (!(await getSession()))
    return Response.json(
      { error: "Sign-in required." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  const { path } = await context.params;
  if (!validAnalyticsPath(path))
    return Response.json(
      { error: "Unknown analytics endpoint." },
      { status: 400 },
    );
  try {
    const data = await fetchAnalytics(path);
    return Response.json(data, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return Response.json(
      { error: "The analytics service is unavailable. Please try again." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
