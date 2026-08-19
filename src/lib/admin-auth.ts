import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { dbAdmin } from "@/lib/db-admin";

export interface AdminUser {
  email: string;
  role: "superadmin" | "admin";
}

async function lookupAdmin(email: string): Promise<AdminUser | null> {
  const { data } = await dbAdmin()
    .from("admins")
    .select("email, role")
    .ilike("email", email)
    .maybeSingle();
  return (data as AdminUser) ?? null;
}

// Pages: no Kinde session → Kinde login. Authenticated but not in the
// admins table → straight to the storefront homepage (never back into
// Kinde login, which would loop).
export async function requireAdmin(): Promise<AdminUser> {
  const { getUser, isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) redirect("/api/auth/login");
  const user = await getUser();
  if (!user?.email) redirect("/api/auth/login");

  const admin = await lookupAdmin(user.email);
  if (!admin) redirect("/");
  return admin;
}

export async function requireSuperAdmin(): Promise<AdminUser> {
  const admin = await requireAdmin();
  if (admin.role !== "superadmin") redirect("/admin/products");
  return admin;
}

// API routes — returns null instead of redirecting.
export async function getAdminOrNull(): Promise<AdminUser | null> {
  const { getUser, isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) return null;
  const user = await getUser();
  if (!user?.email) return null;
  return lookupAdmin(user.email);
}
