// src/lib/catalog.ts
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import type { Model, Product } from "@/types";

export const getCatalog = unstable_cache(
    async () => {
        const client = db();
        const [{ data: models }, { data: products }] = await Promise.all([
            client.from("models").select("*").eq("is_active", true).order("sort_order"),
            client
                .from("products")
                .select("*, product_models(model_id), product_variants(*)")
                .eq("is_active", true)
                .order("sort_order"),
        ]);
        return {
            models: (models ?? []) as Model[],
            products: (products ?? []) as Product[],
        };
    },
    ["catalog"],           // cache key
    { tags: ["catalog"] }  // no revalidate number = cache indefinitely until invalidated
);