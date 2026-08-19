import { NextResponse } from "next/server";
import { getAdminOrNull } from "@/lib/admin-auth";
import { dbAdmin } from "@/lib/db-admin";
import { productPayloadSchema, firstError } from "@/lib/validation";

// Update — resets model links + variants (order_items keep their own
// snapshots so history is safe).
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminOrNull();
  if (!admin) return NextResponse.json({ error: "Not authorised." }, { status: 401 });

  const { id: productId } = await params;
  const parsed = productPayloadSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  }
  const { product, modelIds, variants } = parsed.data;

  const db = dbAdmin();
  const { error } = await db.from("products").update(product).eq("id", productId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await db.from("product_models").delete().eq("product_id", productId);
  await db
    .from("product_models")
    .insert(modelIds.map((model_id) => ({ product_id: productId, model_id })));

  await db.from("product_variants").delete().eq("product_id", productId);
  if (variants.length) {
    await db.from("product_variants").insert(
      variants.map((v, i) => ({ ...v, product_id: productId, sort_order: i }))
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminOrNull();
  if (!admin) return NextResponse.json({ error: "Not authorised." }, { status: 401 });

  const { id } = await params;
  // Soft delete — keeps order history intact.
  const { error } = await dbAdmin()
    .from("products")
    .update({ is_active: false })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
