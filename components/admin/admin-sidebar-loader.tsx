import "server-only";

import { getPendingCount } from "@/server/booking/queries";
import { AdminSidebar } from "./admin-sidebar";

export async function AdminSidebarLoader() {
  const pendingCount = await getPendingCount();
  return <AdminSidebar pendingCount={pendingCount} />;
}
