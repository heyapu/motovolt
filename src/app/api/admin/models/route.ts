import { NextResponse } from "next/server";
import { getAdminOrNull } from "@/lib/admin-auth";
import { dbAdmin } from "@/lib/db-admin";
import { modelCreateSchema, firstError } from "@/lib/validation";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export async function POST(req: Request) {
  const admin = await getAdminOrNull();
  if (!admin) return NextResponse.json({ error: "Not authorised." }, { status: 401 });

  const parsed = modelCreateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  }
  const body = parsed.data;

  const { data, error } = await dbAdmin()
    .from("models")
    .insert({
      name: body.name,
      slug: slugify(body.name),
      banner_title: body.banner_title || null,
      banner_image: body.banner_image || null,
      sort_order: body.sort_order ?? 0,
    })
    .select("id")
    .single();

  if (error) {
    const msg = error.code === "23505" ? "A model with that name already exists." : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ id: data.id });
}
