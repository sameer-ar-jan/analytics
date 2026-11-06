import Roas2y from "@/features/analytics/Pages/2y_ROAS/2y_roas";
import { requireSession } from "@/lib/server/auth";
import { loadReport } from "@/lib/server/analytics";
import ReportNotice from "@/components/report-notice";

export const metadata = { title: "Long-term ROAS | App Analytics" };

export default async function RoasPage() {
  await requireSession();
  const { data, failed } = await loadReport([["roas_2y", "I", "2248"]]);
  return (
    <>
      {/* <ReportNotice failed={failed} /> */}
      <Roas2y initialRows={data[0]} />
    </>
  );
}
