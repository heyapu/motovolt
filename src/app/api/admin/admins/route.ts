import { NextResponse } from "next/server";
import { getAdminOrNull } from "@/lib/admin-auth";
import { dbAdmin } from "@/lib/db-admin";
import { adminCreateSchema, firstError } from "@/lib/validation";

// Only the superadmin manages the admin list.
export async function POST(req: Request) {
  const admin = await getAdminOrNull();
  if (admin?.role !== "superadmin") {
    return NextResponse.json({ error: "Superadmin only." }, { status: 403 });
  }

  const parsed = adminCreateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  }
  const { email, role } = parsed.data;

  const { error } = await dbAdmin().from("admins").insert({
    email,
    role,
    added_by: admin.email,
  });
  if (error) {
    const msg = error.code === "23505" ? "That email is already an admin." : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const admin = await getAdminOrNull();
  if (admin?.role !== "superadmin") {
    return NextResponse.json({ error: "Superadmin only." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email")?.toLowerCase();
  if (!email) return NextResponse.json({ error: "Email required." }, { status: 400 });
  if (email === admin.email.toLowerCase()) {
    return NextResponse.json({ error: "You can't remove yourself." }, { status: 400 });
  }

  const { error } = await dbAdmin().from("admins").delete().ilike("email", email);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
