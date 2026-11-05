import Overall from "@/features/analytics/Pages/Overall/Overall";
import { requireSession } from "@/lib/server/auth";
import { loadReport } from "@/lib/server/analytics";
import ReportNotice from "@/components/report-notice";

export const metadata = { title: "Overall | App Analytics" };

export default async function OverallPage() {
  await requireSession();
  const { data, failed } = await loadReport([
    ["stackoverflow", "AI"],
    ["month", "AIMA"],
  ]);
  return (
    <>
      <ReportNotice failed={failed} />
      <Overall initialData={{ daily: data[0], monthly: data[1] }} />
    </>
  );
}
