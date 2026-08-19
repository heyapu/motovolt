import Link from "next/link";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { Zap } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import "@/styles/admin.css";

export const metadata = { title: "Motovolt Admin" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="flex items-center gap-6 border-b bg-background px-6 py-3">
        <Link href="/admin/products" className="flex items-center gap-2 font-bold tracking-wider">
          <Zap size={18} className="text-primary" /> MOTOVOLT ADMIN
        </Link>
        <nav className="flex gap-4 text-sm text-muted-foreground">
          <Link href="/admin/products" className="hover:text-foreground">
            Products
          </Link>
          <Link href="/admin/models" className="hover:text-foreground">
            Models
          </Link>
          {admin.role === "superadmin" && (
            <Link href="/admin/admins" className="hover:text-foreground">
              Admins
            </Link>
          )}
          <Link href="/" className="hover:text-foreground">
            View store ↗
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">{admin.email}</span>
          <LogoutLink className="font-medium text-destructive hover:underline">
            Sign out
          </LogoutLink>
        </div>
      </header>
      <div className="mx-auto max-w-5xl p-6">{children}</div>
    </div>
  );
}
