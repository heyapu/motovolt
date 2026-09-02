import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import AccessoriesPage from "@/app/AccessoriesPage";
import type { Model, Product } from "@/types";

export const revalidate = 60;

export default async function ModelPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const client = db();

    const [{ data: models }, { data: products }] = await Promise.all([
        client.from("models").select("*").eq("is_active", true).order("sort_order"),
        client
            .from("products")
            .select("*, product_models(model_id), product_variants(*)")
            .eq("is_active", true)
            .order("sort_order"),
    ]);

    const activeModel = (models ?? []).find((m) => m.slug === slug);
    if (!activeModel) notFound();

    return (
        <AccessoriesPage
            models={(models ?? []) as Model[]}
            products={(products ?? []) as Product[]}
            activeId={activeModel.id}
        />
    );
}