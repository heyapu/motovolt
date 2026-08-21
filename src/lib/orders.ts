import "server-only";
import { dbAdmin } from "@/lib/db-admin";
import { razorpay } from "@/lib/razorpay";

interface RzpAddress {
  name?: string;
  contact?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  country?: string;
}

// Central place to reconcile a paid Razorpay order back into our DB.
// Called by both the browser handler and the webhook, and idempotent —
// re-running is a no-op after the first success. This is where we
// PULL the customer details/address that the customer entered inside
// Razorpay's Magic Checkout modal.
export async function markOrderPaid(rzpOrderId: string, rzpPaymentId?: string) {
  const db = dbAdmin();

  const { data: order } = await db
    .from("orders")
    .select("id, status, order_items(product_id, variant_id, quantity)")
    .eq("rzp_order_id", rzpOrderId)
    .single();

  if (!order || order.status === "PAID" || order.status === "DELIVERED" || order.status === "REFUNDED") {
    return order?.id ?? null;
  }

  // Fetch the full Razorpay order — it now contains customer_details
  // filled in by the customer inside Magic Checkout.
  let customerName: string | null = null;
  let customerPhone: string | null = null;
  let customerEmail: string | null = null;
  let address: Record<string, string> | null = null;
  try {
    const rzp = razorpay();
    const rzpOrder = (await rzp.orders.fetch(rzpOrderId)) as {
      customer_details?: {
        contact?: string;
        email?: string;
        shipping_address?: RzpAddress;
      };
    };
    const cd = rzpOrder.customer_details;
    const shipping = cd?.shipping_address;
    if (shipping) {
      customerName = shipping.name ?? null;
      customerPhone = shipping.contact ?? cd?.contact ?? null;
      customerEmail = cd?.email ?? null;
      address = {
        line1: shipping.line1 ?? "",
        line2: shipping.line2 ?? "",
        city: shipping.city ?? "",
        state: shipping.state ?? "",
        pincode: shipping.zipcode ?? "",
      };
    } else if (cd) {
      customerPhone = cd.contact ?? null;
      customerEmail = cd.email ?? null;
    }
  } catch (err) {
    // Non-fatal — payment IS captured; we just couldn't enrich the row.
    // The webhook will retry; admin can also see raw details in Razorpay.
    console.error("Could not fetch Razorpay order for enrichment:", err);
  }

  const patch: Record<string, unknown> = {
    status: "PAID",
    rzp_payment_id: rzpPaymentId ?? null,
    paid_at: new Date().toISOString(),
  };
  if (customerName) patch.customer_name = customerName;
  if (customerPhone) patch.customer_phone = customerPhone;
  if (customerEmail) patch.customer_email = customerEmail;
  if (address) patch.address = address;

  const { error: updateErr } = await db.from("orders").update(patch).eq("id", order.id);
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
