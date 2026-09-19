import { notFound } from "next/navigation";
import AccessoriesPage from "@/app/(storefront)/AccessoriesPage";
import { getCachedModels, getCachedProducts } from "@/lib/cache-queries";

export default async function ModelPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    // Fetched from Redis (ms latency) instead of Supabase
    const [models, products] = await Promise.all([
        getCachedModels(),
        getCachedProducts(),
    ]);

    const activeModel = models.find((m) => m.slug === slug);
    if (!activeModel) notFound();

    return (
        <AccessoriesPage
            models={models}
            products={products}
            activeId={activeModel.id}
        />
    );
}