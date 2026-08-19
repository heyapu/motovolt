import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ProductDetail from "@/components/ProductDetail/ProductDetail";
import type { Product } from "@/types";

export const revalidate = 60;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data } = await db()
    .from("products")
    .select("*, product_variants(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!data) notFound();
  return <ProductDetail product={data as Product} />;
}
