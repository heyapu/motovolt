import { requireSuperAdmin } from "@/lib/admin-auth";
import { dbAdmin } from "@/lib/db-admin";
import AdminsManager from "@/components/admin/AdminsManager";
import type { AdminRow } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminsPage() {
  const me = await requireSuperAdmin();
  const { data: admins } = await dbAdmin()
    .from("admins")
    .select("*")
    .order("created_at");

  return <AdminsManager admins={(admins ?? []) as AdminRow[]} myEmail={me.email} />;
}
