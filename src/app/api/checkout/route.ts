import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/db-admin";
import { razorpay } from "@/lib/razorpay";
import { checkoutSchema, firstError } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

// Prices are recomputed from the DB — the client is never trusted with amounts.
export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!rateLimit(`checkout:${ip}`, 10, 60_000)) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    const parsed = checkoutSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
    }
    const { items, customer, address } = parsed.data;

    const db = dbAdmin();
    const productIds = [...new Set(items.map((i) => i.productId))];
    const { data: products, error } = await db
      .from("products")
      .select("*, product_variants(*)")
      .in("id", productIds)
      .eq("is_active", true);
    if (error) throw error;

    let amount = 0;
    const orderItems = items.map((i) => {
      const product = products?.find((p) => p.id === i.productId);
      if (!product) throw new Error("A product in your cart is unavailable.");
      const variant = i.variantId
        ? product.product_variants?.find((v: any) => v.id === i.variantId)
        : null;
      if (i.variantId && !variant)
        throw new Error("A selected variant is no longer available.");
      const stock = variant ? variant.stock : product.stock;
      if (stock < i.quantity) {
        throw new Error(`"${product.title}" has only ${stock} left in stock.`);
      }
      const unitPrice = Number(variant?.price_override ?? product.price);
      amount += unitPrice * i.quantity;
      return {
        product_id: product.id,
        variant_id: variant?.id ?? null,
        title: product.title,
        variant_label: variant?.label ?? null,
        unit_price: unitPrice,
        quantity: i.quantity,
      };
    });

    // 1. local order (PENDING) — the DB copy of customer + address
    const { data: order, error: orderErr } = await db
      .from("orders")
      .insert({
        amount,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_email: customer.email || null,
        address,
        status: "PENDING",
      })
      .select("id")
      .single();
    if (orderErr) throw orderErr;

    await db
      .from("order_items")
      .insert(orderItems.map((oi) => ({ ...oi, order_id: order.id })));

    // 2. Razorpay order — same customer + address in Razorpay notes
    const rzpOrder = await razorpay().orders.create({
      amount: Math.round(amount * 100), // paise
      currency: "INR",
      receipt: order.id,
      notes: {
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_email: customer.email || "",
        address_line1: address.line1,
        address_line2: address.line2 || "",
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      },
    });

    await db.from("orders").update({ rzp_order_id: rzpOrder.id }).eq("id", order.id);

    return NextResponse.json({
      rzpOrderId: rzpOrder.id,
      amount: Math.round(amount * 100),
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Checkout failed." },
      { status: 500 }
    );
  }
}
