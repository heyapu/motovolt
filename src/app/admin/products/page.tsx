import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { dbAdmin } from "@/lib/db-admin";
import { inr } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  await requireAdmin();
  const { data: products } = await dbAdmin()
    .from("products")
    .select("id, title, price, stock, is_active, product_variants(stock)")
    .order("sort_order");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus size={16} /> Add product
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(products ?? []).map((p) => {
                const variantStocks = (p.product_variants ?? []) as { stock: number }[];
                const total = variantStocks.length
                  ? variantStocks.reduce((n, v) => n + v.stock, 0)
                  : p.stock;
                const lowCombos = variantStocks.filter((v) => v.stock <= 0).length;
                return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell>{inr(p.price)}</TableCell>
                  <TableCell>
                    {total <= 0 ? (
                      <Badge variant="destructive">Out of stock</Badge>
                    ) : (
                      <span>
                        {total}
                        {lowCombos > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {lowCombos} variant{lowCombos > 1 ? "s" : ""} out
                          </Badge>
                        )}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.is_active ? "default" : "secondary"}>
                      {p.is_active ? "Live" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/products/${p.id}`} aria-label={`Edit ${p.title}`}>
                      <Pencil size={16} className="text-muted-foreground hover:text-foreground" />
                    </Link>
                  </TableCell>
                </TableRow>
                );
              })}
              {!products?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No products yet — add your first one.
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
