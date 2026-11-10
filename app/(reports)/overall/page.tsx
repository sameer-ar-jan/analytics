import Overall from "@/features/analytics/Pages/Overall/Overall";
import { requireSession } from "@/lib/server/auth";

export const metadata = { title: "Overall | App Analytics" };

export default async function OverallPage() {
  await requireSession();
  return <Overall />;
}
