import Roas2y from "@/features/analytics/Pages/2y_ROAS/2y_roas";
import { requireSession } from "@/lib/server/auth";

export const metadata = { title: "Long-term ROAS | App Analytics" };

export default async function RoasPage() {
  await requireSession();
  return <Roas2y />;
}
