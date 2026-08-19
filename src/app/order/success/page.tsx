import { dbAdmin } from "@/lib/db-admin";
import SuccessScreen from "./SuccessScreen";
import type { OrderRow } from "@/types";

export const dynamic = "force-dynamic";

// Payment was already verified server-side in /api/razorpay/verify (signature
// check) before the redirect here, and the webhook reconciles independently —
// this page just reads the final state from the DB.
export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const { order_id } = await searchParams;
  if (!order_id) return <SuccessScreen order={null} />;

  const { data: order } = await dbAdmin()
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", order_id)
    .single();

  return <SuccessScreen order={(order as OrderRow) ?? null} />;
}
