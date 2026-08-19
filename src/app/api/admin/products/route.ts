import { NextResponse } from "next/server";
import { getAdminOrNull } from "@/lib/admin-auth";
import { dbAdmin } from "@/lib/db-admin";
import { productPayloadSchema, firstError } from "@/lib/validation";

export async function POST(req: Request) {
  const admin = await getAdminOrNull();
  if (!admin) return NextResponse.json({ error: "Not authorised." }, { status: 401 });

  const parsed = productPayloadSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  }
  const { product, modelIds, variants } = parsed.data;

  const db = dbAdmin();
  const { data: created, error } = await db
    .from("products")
    .insert(product)
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await db
    .from("product_models")
    .insert(modelIds.map((model_id) => ({ product_id: created.id, model_id })));

  if (variants.length) {
    await db.from("product_variants").insert(
      variants.map((v, i) => ({ ...v, product_id: created.id, sort_order: i }))
    );
  }

  return NextResponse.json({ id: created.id });
}
