import CampWise from "@/features/analytics/Pages/campwise/campwise";
import { requireSession } from "@/lib/server/auth";

export const metadata = { title: "Campaigns | App Analytics" };

export default async function CampaignPage() {
  await requireSession();
  return <CampWise />;
}
