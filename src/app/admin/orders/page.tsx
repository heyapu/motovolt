import { requireAdmin } from "@/lib/admin-auth";
import { dbAdmin } from "@/lib/db-admin";
import OrdersManager from "@/components/admin/OrdersManager";
import type { OrderRow } from "@/types";

export const dynamic = "force-dynamic";

// Orders load server-side — the page is never empty on first paint and
// there's no client fetch to fail.
export default async function OrdersPage() {
  await requireAdmin();
  const { data: orders } = await dbAdmin()
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false })
    .limit(200);

  return <OrdersManager orders={(orders ?? []) as OrderRow[]} />;
}
