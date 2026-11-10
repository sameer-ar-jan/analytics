import Dashboard from "@/features/analytics/Pages/Dashboard/Dashboard";
import { requireSession } from "@/lib/server/auth";

export const metadata = { title: "Dashboard | App Analytics" };

export default async function DashboardPage() {
  await requireSession();
  return <Dashboard />;
}
