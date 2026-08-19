import { db } from "@/lib/db";
import AccessoriesPage from "./AccessoriesPage";
import type { Model, Product } from "@/types";

export const revalidate = 60;

export default async function Home() {
  const client = db();
  const [{ data: models }, { data: products }] = await Promise.all([
    client.from("models").select("*").eq("is_active", true).order("sort_order"),
    client
      .from("products")
      .select("*, product_models(model_id), product_variants(*)")
      .eq("is_active", true)
      .order("sort_order"),
  ]);

  return (
    <AccessoriesPage
      models={(models ?? []) as Model[]}
      products={(products ?? []) as Product[]}
    />
  );
}
