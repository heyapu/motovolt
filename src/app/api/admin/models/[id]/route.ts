import { NextResponse } from "next/server";
import { getAdminOrNull } from "@/lib/admin-auth";
import { dbAdmin } from "@/lib/db-admin";
import { modelUpdateSchema, firstError } from "@/lib/validation";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminOrNull();
  if (!admin) return NextResponse.json({ error: "Not authorised." }, { status: 401 });

  const { id } = await params;
  const parsed = modelUpdateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  }
  const body = parsed.data;

  const { error } = await dbAdmin()
    .from("models")
    .update({
      name: body.name,
      banner_title: body.banner_title || null,
      banner_image: body.banner_image || null,
      sort_order: body.sort_order ?? 0,
      is_active: body.is_active ?? true,
    })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
