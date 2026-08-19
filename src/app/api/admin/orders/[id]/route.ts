import { NextResponse } from "next/server";
import { getAdminOrNull } from "@/lib/admin-auth";
import { dbAdmin } from "@/lib/db-admin";

// Not used by the order detail page (that queries Supabase directly), but
// kept available for any client-side fetch of a single order's data.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminOrNull();
  if (!admin) return NextResponse.json({ error: "Not authorised." }, { status: 401 });

  const { id } = await params;
  const { data: order, error } = await dbAdmin()
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  return NextResponse.json(order);
}
