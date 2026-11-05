import DashboardBuilder from "@/features/analytics/Components/DashboardBuilder/DashboardBuilder";
import { requireSession } from "@/lib/server/auth";
import { loadReport } from "@/lib/server/analytics";
import ReportNotice from "@/components/report-notice";

export const metadata = { title: "Dashboard Builder | App Analytics" };

export default async function DashboardBuilderPage() {
  await requireSession();
  const { data, failed } = await loadReport([["stackoverflow", "AI"]]);

  return (
    <main>
      <ReportNotice failed={failed} />
      <DashboardBuilder initialData={{ rows: data[0] }} />
    </main>
  );
}
