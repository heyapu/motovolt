"use client";
import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import OrderActions from "@/components/admin/OrderActions";
import { inr, formatDateTime } from "@/lib/format";
import type { OrderRow } from "@/types";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export const statusVariant: Record<OrderRow["status"], BadgeVariant> = {
  PENDING: "secondary",
  PAID: "default",
  DELIVERED: "outline",
  FAILED: "destructive",
  REFUNDED: "destructive",
};

export default function OrdersManager({ orders }: { orders: OrderRow[] }) {
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | OrderRow["status"]>("ALL");

  const filtered = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);
  const counts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Orders</h1>

      <div className="flex flex-wrap gap-2">
        {(["ALL", "PAID", "DELIVERED", "PENDING", "FAILED", "REFUNDED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              filter === s ? "border-primary bg-primary text-primary-foreground" : "bg-background"
            }`}
          >
            {s === "ALL" ? `All (${orders.length})` : `${s} (${counts[s] ?? 0})`}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Placed</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="whitespace-nowrap">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {formatDateTime(order.created_at)}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      #{order.id.slice(0, 8)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{order.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                  </TableCell>
                  <TableCell className="max-w-56">
                    <p className="truncate text-sm">
                      {order.order_items
                        .map((i) => `${i.quantity}× ${i.title}${i.variant_label ? ` (${i.variant_label})` : ""}`)
                        .join(", ")}
                    </p>
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-medium">
                    {inr(order.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <OrderActions orderId={order.id} status={order.status} onError={setError} />
                  </TableCell>
                </TableRow>
              ))}
              {!filtered.length && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No orders here yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
