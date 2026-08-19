import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { markOrderPaid } from "@/lib/orders";
import { dbAdmin } from "@/lib/db-admin";

// Backup source of truth — fires even if the user closes the tab
// before the browser handler runs. markOrderPaid is idempotent.
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "payment.captured") {
    const payment = event.payload?.payment?.entity;
    if (payment?.order_id) {
      await markOrderPaid(payment.order_id, payment.id);
    }
  } else if (event.event === "payment.failed") {
    const payment = event.payload?.payment?.entity;
    if (payment?.order_id) {
      await dbAdmin()
        .from("orders")
        .update({ status: "FAILED" })
        .eq("rzp_order_id", payment.order_id)
        .neq("status", "PAID");
    }
  }

  return NextResponse.json({ ok: true });
}
