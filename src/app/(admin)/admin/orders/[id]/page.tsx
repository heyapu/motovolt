import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { dbAdmin } from "@/lib/db-admin";
import OrderDetails from "@/components/admin/OrderDetails";
import type { OrderRow } from "@/types";

export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const { data: order } = await dbAdmin()
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .maybeSingle();

  if (!order) notFound();
  return <OrderDetails order={order as OrderRow} />;
}
