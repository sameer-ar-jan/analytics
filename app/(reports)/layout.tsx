import type { ReactNode } from "react";
import ApiStatus from "@/components/api-status";
import { requireSession } from "@/lib/server/auth";

export default async function ReportsLayout({ children }: { children: ReactNode }) {
  await requireSession();
  return <><ApiStatus />{children}</>;
}
