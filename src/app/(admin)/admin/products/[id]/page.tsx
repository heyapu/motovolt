import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { dbAdmin } from "@/lib/db-admin";
import ProductForm from "@/components/admin/ProductForm";
import type { Model, Product } from "@/types";

export const dynamic = "force-dynamic";

export default async function EditProduct({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const db = dbAdmin();
  const [{ data: models }, { data: product }] = await Promise.all([
    db.from("models").select("*").order("sort_order"),
    db
      .from("products")
      .select("*, product_variants(*), product_models(model_id)")
      .eq("id", id)
      .single(),
  ]);
  if (!product) notFound();
  return (
    <ProductForm models={(models ?? []) as Model[]} product={product as Product} />
  );
}
