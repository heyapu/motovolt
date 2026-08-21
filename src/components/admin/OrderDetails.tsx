"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import OrderActions from "@/components/admin/OrderActions";
import { statusVariant } from "@/components/admin/OrdersManager";
import { inr, formatDateTime } from "@/lib/format";
import type { OrderRow } from "@/types";

export default function OrderDetails({ order }: { order: OrderRow }) {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} /> Orders
        </Link>
        <h1 className="text-xl font-bold">#{order.id.slice(0, 8)}</h1>
        <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
        <div className="ml-auto">
          <OrderActions orderId={order.id} status={order.status} onError={setError} />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{order.customer_name ?? "—"}</p>
            <p>{order.customer_phone ?? "—"}</p>
            {order.customer_email && <p>{order.customer_email}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Delivery address</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {order.address ? (
              <>
                <p>
                  {order.address.line1}
                  {order.address.line2 ? `, ${order.address.line2}` : ""}
                </p>
                <p>
                  {order.address.city}, {order.address.state} — {order.address.pincode}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">Not yet captured — payment pending.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="text-lg font-bold">{inr(order.amount)}</p>
            <p className="text-muted-foreground">
              Placed {formatDateTime(order.created_at)}
            </p>
            {order.paid_at && (
              <p className="text-muted-foreground">Paid {formatDateTime(order.paid_at)}</p>
            )}
            {order.rzp_payment_id && (
              <p className="break-all text-xs text-muted-foreground">
                Razorpay: {order.rzp_payment_id}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Unit price</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.order_items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.title}
                    {item.variant_label && (
                      <span className="text-muted-foreground"> ({item.variant_label})</span>
                    )}
                  </TableCell>
                  <TableCell>{inr(item.unit_price)}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {inr(Number(item.unit_price) * item.quantity)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
