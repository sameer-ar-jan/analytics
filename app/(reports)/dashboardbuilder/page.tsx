import DashboardBuilder from "@/features/analytics/Components/DashboardBuilder/DashboardBuilder";
import { requireSession } from "@/lib/server/auth";

export const metadata = { title: "Dashboard Builder | App Analytics" };

export default async function DashboardBuilderPage() {
  await requireSession();
  return (
    <main>
      <DashboardBuilder />
    </main>
  );
}
