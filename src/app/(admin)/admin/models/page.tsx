import { requireAdmin } from "@/lib/admin-auth";
import { dbAdmin } from "@/lib/db-admin";
import ModelsManager from "@/components/admin/ModelsManager";
import type { Model } from "@/types";

export const dynamic = "force-dynamic";

export default async function ModelsPage() {
  await requireAdmin();
  const { data: models } = await dbAdmin()
    .from("models")
    .select("*")
    .order("sort_order");
  return <ModelsManager models={(models ?? []) as Model[]} />;
}
