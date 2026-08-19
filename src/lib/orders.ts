// Shared "mark paid" logic used by both the verify endpoint and the webhook,
// so stock is decremented exactly once no matter which fires first.
import { dbAdmin } from "@/lib/db-admin";

export async function markOrderPaid(rzpOrderId: string, rzpPaymentId?: string) {
  const db = dbAdmin();
  const { data: order } = await db
    .from("orders")
    .select("id, status, order_items(product_id, variant_id, quantity)")
    .eq("rzp_order_id", rzpOrderId)
    .single();

  if (!order || order.status === "PAID") return order?.id ?? null;

  const { error: updateErr } = await db
    .from("orders")
    .update({
      status: "PAID",
      rzp_payment_id: rzpPaymentId ?? null,
      paid_at: new Date().toISOString(),
    })
    .eq("id", order.id);
  if (updateErr) throw new Error(`Could not mark order paid: ${updateErr.message}`);

  for (const item of order.order_items ?? []) {
    if (item.variant_id) {
      await db.rpc("decrement_variant_stock", { v_id: item.variant_id, qty: item.quantity });
    } else if (item.product_id) {
      await db.rpc("decrement_product_stock", { p_id: item.product_id, qty: item.quantity });
    }
  }
  return order.id;
}
