import { NextResponse } from "next/server";
import { getAdminOrNull } from "@/lib/admin-auth";
import { dbAdmin } from "@/lib/db-admin";
import { razorpay } from "@/lib/razorpay";
import { orderActionSchema, firstError } from "@/lib/validation";

// Deliver / refund. The orders LIST is server-rendered by the page itself,
// so this route only mutates.
export async function POST(req: Request) {
  const admin = await getAdminOrNull();
  if (!admin) return NextResponse.json({ error: "Not authorised." }, { status: 401 });

  const parsed = orderActionSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  }
  const { id, action } = parsed.data;

  const db = dbAdmin();
  const { data: order, error } = await db
    .from("orders")
    .select("id, status, rzp_payment_id")
    .eq("id", id)
    .maybeSingle();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  if (order.status !== "PAID") {
    return NextResponse.json(
      { error: `Order is ${order.status} — only PAID orders can be delivered or refunded.` },
      { status: 400 }
    );
  }

  if (action === "deliver") {
    const { error: updateErr } = await db
      .from("orders")
      .update({ status: "DELIVERED" })
      .eq("id", id)
      .eq("status", "PAID"); // guard against races
    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true, status: "DELIVERED" });
  }

  // ----- refund -----
  if (!order.rzp_payment_id) {
    return NextResponse.json(
      { error: "This order has no Razorpay payment id — it can't be refunded from here." },
      { status: 400 }
    );
  }

  try {
    const rzp = razorpay();
    const payment = await rzp.payments.fetch(order.rzp_payment_id);

    // Razorpay only refunds CAPTURED payments. Checkout normally
    // auto-captures, but an "authorized" payment must be captured first.
    if (payment.status === "authorized") {
      await rzp.payments.capture(order.rzp_payment_id, payment.amount, payment.currency);
    } else if (payment.status === "refunded") {
      // Already refunded on Razorpay's side — just sync our DB.
    } else if (payment.status !== "captured") {
      return NextResponse.json(
        { error: `Payment status is "${payment.status}" — it can't be refunded.` },
        { status: 400 }
      );
    }

    if (payment.status !== "refunded") {
      await rzp.payments.refund(order.rzp_payment_id, {
        speed: "normal",
        notes: { refunded_by: admin.email },
      });
    }

    const { error: updateErr } = await db
      .from("orders")
      .update({ status: "REFUNDED" })
      .eq("id", id);
    if (updateErr) {
      // Money HAS moved at Razorpay; make the mismatch loud.
      return NextResponse.json(
        { error: `Refund succeeded at Razorpay but the order could not be updated: ${updateErr.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true, status: "REFUNDED" });
  } catch (err) {
    const e = err as { error?: { description?: string }; message?: string };
    const message = e?.error?.description ?? e?.message ?? "Refund failed at Razorpay.";
    console.error("Razorpay refund error:", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(req: Request) {
  // 1. Authenticate
  const admin = await getAdminOrNull();
  if (admin?.role !== "superadmin" && admin?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.max(1, parseInt(searchParams.get("limit") || "15", 10));
  const status = searchParams.get("status") || "ALL";

  const start = (page - 1) * limit;
  const end = start + limit - 1;

  // 2. Build the paginated Supabase query
  let query = dbAdmin()
    .from("orders")
    .select("*, order_items(*)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(start, end);

  if (status !== "ALL") {
    query = query.eq("status", status);
  }

  const { data: orders, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 3. Fetch counts for the status tabs (executed in parallel for speed)
  const statuses = ["PAID", "DELIVERED", "PENDING", "FAILED", "REFUNDED"];
  const statusCounts: Record<string, number> = {};
  
  const { count: allCount } = await dbAdmin().from("orders").select("*", { count: "exact", head: true });
  statusCounts["ALL"] = allCount || 0;

  await Promise.all(
    statuses.map(async (s) => {
      const { count: sCount } = await dbAdmin()
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", s);
      statusCounts[s] = sCount || 0;
    })
  );

  return NextResponse.json({
    orders: orders || [],
    totalPages: count ? Math.ceil(count / limit) : 0,
    statusCounts
  });
}