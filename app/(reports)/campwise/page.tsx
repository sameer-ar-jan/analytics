import CampWise from "@/features/analytics/Pages/campwise/campwise";
import { requireSession } from "@/lib/server/auth";
import { loadReport } from "@/lib/server/analytics";
import ReportNotice from "@/components/report-notice";

export const metadata = { title: "Campaigns | App Analytics" };

function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default async function CampaignPage() {
  await requireSession();
  const start = new Date();
  const end = new Date();
  start.setDate(start.getDate() - 30);
  end.setDate(end.getDate() - 1);
  const startDate = formatDate(start);
  const endDate = formatDate(end);
  const { data, failed } = await loadReport([
    ["ret_roas", "AI", "x2"],
    ["ret_roas", "AI", "x2", startDate, endDate, "-", "-"],
  ]);
  return (
    <>
      <ReportNotice failed={failed} />
      <CampWise
        initialData={{ rows: data[1], options: data[0], startDate, endDate }}
      />
    </>
  );
}
