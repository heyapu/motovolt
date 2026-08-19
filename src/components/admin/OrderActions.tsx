"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PackageCheck, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Shared Deliver / Refund buttons used by the orders list and detail page.
export default function OrderActions({
  orderId,
  status,
  onError,
}: {
  orderId: string;
  status: string;
  onError: (msg: string | null) => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"deliver" | "refund" | null>(null);

  if (status !== "PAID") return null;

  async function act(action: "deliver" | "refund") {
    if (
      action === "refund" &&
      !confirm("Refund this order? The money goes back to the customer via Razorpay.")
    ) {
      return;
    }
    setBusy(action);
    onError(null);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Action failed.");
      router.refresh();
    } catch (e) {
      onError(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" disabled={busy !== null} onClick={() => act("deliver")}>
        {busy === "deliver" ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <PackageCheck size={14} />
        )}
        Delivered
      </Button>
      <Button
        size="sm"
        variant="destructive"
        disabled={busy !== null}
        onClick={() => act("refund")}
      >
        {busy === "refund" ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Undo2 size={14} />
        )}
        Refund
      </Button>
    </div>
  );
}
