import { requireAdmin } from "@/lib/admin-auth";
import { dbAdmin } from "@/lib/db-admin";
import ProductForm from "@/components/admin/ProductForm";
import type { Model } from "@/types";

export const dynamic = "force-dynamic";

export default async function NewProduct() {
  await requireAdmin();
  const { data: models } = await dbAdmin().from("models").select("*").order("sort_order");
  return <ProductForm models={(models ?? []) as Model[]} product={null} />;
}
