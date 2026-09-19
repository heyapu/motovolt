import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import type { Model, Product } from "@/types";

const CACHE_TTL = 3600; // 1 hour in seconds

export async function getCachedModels(): Promise<Model[]> {
    const cacheKey = "store:models:active";
    const cached = await redis.get<Model[]>(cacheKey);

    if (cached) return cached;

    const { data } = await db()
        .from("models")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

    const models = (data ?? []) as Model[];
    await redis.set(cacheKey, models, { ex: CACHE_TTL });

    return models;
}

export async function getCachedProducts(): Promise<Product[]> {
    const cacheKey = "store:products:active";
    const cached = await redis.get<Product[]>(cacheKey);

    if (cached) return cached;

    const { data } = await db()
        .from("products")
        .select("*, product_models(model_id), product_variants(*)")
        .eq("is_active", true)
        .order("sort_order");

    const products = (data ?? []) as Product[];
    await redis.set(cacheKey, products, { ex: CACHE_TTL });

    return products;
}