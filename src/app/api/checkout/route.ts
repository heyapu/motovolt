import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/db-admin";
import { razorpay } from "@/lib/razorpay";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

// Magic Checkout takes address inside its own modal, so the client only
// sends line items + optional prefill hints. Prices are still recomputed
// from the DB — the client is never trusted with amounts.
const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        variantId: z.string().uuid().nullable(),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1, "Cart is empty."),
  prefill: z
    .object({
      name: z.string().optional(),
      contact: z.string().optional(),
      email: z.string().optional(),
    })
    .optional(),
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!rateLimit(`checkout:${ip}`, 10, 60_000)) {
      return NextResponse.json({ error: "Too many attempts. Try again in a minute." }, { status: 429 });
    }

    const parsed = checkoutSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { items, prefill } = parsed.data;

    const db = dbAdmin();
    const productIds = [...new Set(items.map((i) => i.productId))];
    const { data: products, error } = await db
      .from("products")
      .select("*, product_variants(*)")
      .in("id", productIds)
      .eq("is_active", true);
    if (error) throw error;

    let amount = 0;
    const orderItems: {
      product_id: string;
      variant_id: string | null;
      title: string;
      variant_label: string | null;
      unit_price: number;
      quantity: number;
    }[] = [];
    const lineItems: {
      sku: string;
      variant_id: string;
      name: string;
      description: string;
      price: number;
      offer_price: number;
      quantity: number;
      image_url?: string;
    }[] = [];

    for (const i of items) {
      const product = products?.find((p) => p.id === i.productId);
      if (!product) throw new Error("A product in your cart is unavailable.");
      const variant = i.variantId
        ? product.product_variants?.find((v: { id: string }) => v.id === i.variantId)
        : null;
      if (i.variantId && !variant)
        throw new Error("A selected variant is no longer available.");
      const stock = variant ? variant.stock : product.stock;
      if (stock < i.quantity) throw new Error(`"${product.title}" has only ${stock} left in stock.`);

      const unitPrice = Number(variant?.price_override ?? product.price);
      amount += unitPrice * i.quantity;

      orderItems.push({
        product_id: product.id,
        variant_id: variant?.id ?? null,
        title: product.title,
        variant_label: variant?.label ?? null,
        unit_price: unitPrice,
        quantity: i.quantity,
      });

      // Magic Checkout requires a per-item description; prices in paise.
      lineItems.push({
        sku: product.id,
        variant_id: variant?.id ?? product.id,
        name: product.title + (variant?.label ? ` (${variant.label})` : ""),
        description: product.description ?? product.title,
        price: Math.round(unitPrice * 100),
        offer_price: Math.round(unitPrice * 100),
        quantity: i.quantity,
        image_url: variant?.image ?? product.image ?? undefined,
      });
    }

    // 1. Local order — PENDING, no customer data yet (Magic Checkout will fill it).
    const { data: order, error: orderErr } = await db
      .from("orders")
      .insert({ amount, status: "PENDING" })
      .select("id")
      .single();
    if (orderErr) throw orderErr;

    await db.from("order_items").insert(orderItems.map((oi) => ({ ...oi, order_id: order.id })));

    // 2. Razorpay Magic Checkout order — line_items_total is the trigger
    //    that switches from Standard to Magic Checkout on Razorpay's side.
    const amountPaise = Math.round(amount * 100);
    const rzpOrder = await razorpay().orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: order.id,
      line_items_total: amountPaise,
      line_items: lineItems,
      notes: { our_order_id: order.id },
    } as unknown as Parameters<ReturnType<typeof razorpay>["orders"]["create"]>[0]);

    await db.from("orders").update({ rzp_order_id: rzpOrder.id }).eq("id", order.id);

    return NextResponse.json({
      rzpOrderId: rzpOrder.id,
      amount: amountPaise,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      prefill: prefill ?? {},
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Checkout failed." },
      { status: 500 }
    );
  }
}
