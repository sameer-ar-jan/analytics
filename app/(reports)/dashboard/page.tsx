import Dashboard from "@/features/analytics/Pages/Dashboard/Dashboard";
import { requireSession } from "@/lib/server/auth";
import { loadReport } from "@/lib/server/analytics";
import ReportNotice from "@/components/report-notice";

export const metadata = { title: "Dashboard | App Analytics" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireSession();
  const params = await searchParams;
  const game = typeof params.game === "string" ? params.game : "x2";
  const query = typeof params.q === "string" ? params.q : "AI";
  const { data, failed } = await loadReport([
    ["stackoverflow", query, game],
    ["month", `${query}MA`, game],
  ]);
  return (
    <>
      {/* <ReportNotice failed={failed} /> */}
      <Dashboard
        key={`${game}:${query}`}
        initialData={{ game, query, daily: data[0], monthly: data[1] }}
      />
    </>
  );
}
