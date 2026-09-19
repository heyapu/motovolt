import { requireAdmin } from "@/lib/admin-auth";
import OrdersManager from "@/components/admin/OrdersManager";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  await requireAdmin();
  // We no longer fetch orders here. The client will do it via the API.
  return <OrdersManager />;
}