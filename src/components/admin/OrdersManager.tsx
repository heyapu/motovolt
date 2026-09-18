"use client";

import * as React from "react";
import Link from "next/link";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Download, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
  const [error, setError] = React.useState<string | null>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);
  
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "created_at", desc: true } // Default sort by newest
  ]);

  // Explicitly typed as any in callbacks to prevent strict-mode inference failures
  const columns: ColumnDef<OrderRow, any>[] = React.useMemo(() => [
    {
      id: "select",
      header: ({ table }: { table: any }) => (
        <div className="px-1">
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value: any) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }: { row: any }) => (
        <div className="px-1">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value: any) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "serial_number",
      header: "Order #",
      cell: ({ row }: { row: any }) => (
        <span className="font-bold">
          ORD-{String(row.getValue("serial_number")).padStart(4, '0')}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Placed",
      cell: ({ row }: { row: any }) => (
        <div className="whitespace-nowrap">
          <Link
            href={`/admin/orders/${row.original.id}`}
            className="font-medium text-primary hover:underline"
          >
            {formatDateTime(row.getValue("created_at"))}
          </Link>
          <p className="text-xs text-muted-foreground mt-0.5">
            {row.original.rzp_order_id || `#${row.original.id.slice(0, 8)}`}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "customer_name",
      header: "Customer",
      cell: ({ row }: { row: any }) => (
        <div>
          <p className="font-medium">{row.original.customer_name ?? "—"}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.customer_phone ?? "Awaiting payment"}
          </p>
        </div>
      ),
    },
    {
      id: "items",
      header: "Items",
      cell: ({ row }: { row: any }) => (
        <div className="max-w-56">
          <p className="truncate text-sm">
            {row.original.order_items
              ?.map((i: any) => `${i.quantity}× ${i.title}${i.variant_label ? ` (${i.variant_label})` : ""}`)
              .join(", ")}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Total",
      cell: ({ row }: { row: any }) => (
        <span className="whitespace-nowrap font-medium">
          {inr(row.getValue("amount"))}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: any }) => {
        const status = row.getValue("status") as OrderRow["status"];
        return <Badge variant={statusVariant[status]}>{status}</Badge>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: any }) => (
        <OrderActions orderId={row.original.id} status={row.original.status} onError={setError} />
      ),
    },
  ], []);

  const table = useReactTable({
    data: orders,
    columns,
    state: { sorting, columnFilters, rowSelection },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
  });

  const counts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  const currentStatusFilter = (table.getColumn("status")?.getFilterValue() as string) ?? "ALL";

  const handleDownloadPdf = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) return;

    setIsDownloading(true);
    setError(null);

    const orderIds = selectedRows.map((row: any) => row.original.id);

    try {
      const res = await fetch("/api/admin/orders/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds }),
      });

      if (!res.ok) throw new Error("Failed to generate PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Orders_Export_${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setRowSelection({});
    } catch (err) {
      setError("Something went wrong downloading the PDFs.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Orders</h1>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {(["ALL", "PAID", "DELIVERED", "PENDING", "FAILED", "REFUNDED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => table.getColumn("status")?.setFilterValue(s === "ALL" ? "" : s)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                currentStatusFilter === (s === "ALL" ? "" : s)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-background hover:bg-muted"
              }`}
            >
              {s === "ALL" ? `All (${orders.length})` : `${s} (${counts[s] ?? 0})`}
            </button>
          ))}
        </div>

        {Object.keys(rowSelection).length > 0 && (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
            <span className="text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} selected
            </span>
            <Button size="sm" onClick={handleDownloadPdf} disabled={isDownloading}>
              {isDownloading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download PDF
            </Button>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup: any) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header: any) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row: any) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell: any) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}