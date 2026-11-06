import DashboardBuilder from "@/features/analytics/Components/DashboardBuilder/DashboardBuilder";
import { requireSession } from "@/lib/server/auth";
import { loadReport } from "@/lib/server/analytics";
import ReportNotice from "@/components/report-notice";
import { DASHBOARD_GAMES } from "@/features/analytics/Components/DashboardBuilder/dashboard-data";

export const metadata = { title: "Dashboard Builder | App Analytics" };

export default async function DashboardBuilderPage() {
  await requireSession();
  const paths = [
    ["stackoverflow", "AI"],
    ...DASHBOARD_GAMES.map((game) => ["stackoverflow", "AI", game.id]),
  ];
  const { data, failed } = await loadReport(paths);
  const games = Object.fromEntries(
    DASHBOARD_GAMES.map((game, index) => [
      game.id,
      Array.isArray(data[index + 1]) ? data[index + 1] : [],
    ]),
  );

  return (
    <main>
      {/* <ReportNotice failed={failed} /> */}
      <DashboardBuilder
        initialData={{
          rows: Array.isArray(data[0]) ? data[0] : [],
          games,
        }}
      />
    </main>
  );
}
