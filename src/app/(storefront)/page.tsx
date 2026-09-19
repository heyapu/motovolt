import { redirect } from "next/navigation";
import { getCachedModels } from "@/lib/cache-queries";

export default async function Home() {
  // 1. Fetch from Redis (ms latency) instead of scraping Supabase
  const models = await getCachedModels();
  
  // 2. Extract the first model's slug
  const firstModelSlug = models?.[0]?.slug ?? "urbn";

  // 3. Instantly redirect
  redirect(`/models/${firstModelSlug}`);
}