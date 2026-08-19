"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ImageUploader from "@/components/admin/ImageUploader";
import type { Model, Product, ProductOption, ProductVariant } from "@/types";

interface Props {
  models: Model[];
  product: Product | null;
}

interface ComboDraft {
  id?: string;
  label: string;
  options: Record<string, string>;
  price_override: number | null;
  stock: number;
  image: string | null;
}

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const isColor = (name: string) => name.trim().toLowerCase() === "color";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const comboKey = (o: Record<string, string>) =>
  Object.keys(o)
    .sort()
    .map((k) => `${k.trim().toLowerCase()}:${(o[k] ?? "").trim().toLowerCase()}`)
    .join("|");

// Collapse rows that describe the same combination (keeps the row with the
// most stock — duplicates were accidental copies, not additive inventory).
function dedupeCombos(list: ComboDraft[]): ComboDraft[] {
  const byKey = new Map<string, ComboDraft>();
  for (const c of list) {
    const key = comboKey(c.options);
    const existing = byKey.get(key);
    if (!existing || c.stock > existing.stock) byKey.set(key, { ...existing, ...c });
  }
  return [...byKey.values()];
}

// Merge options sharing a name + drop duplicate values, then build the
// cartesian product, carrying over stock/price/image from previous combos.
function buildCombos(options: ProductOption[], previous: ComboDraft[]): ComboDraft[] {
  const byName = new Map<string, { name: string; values: { value: string; hex?: string }[] }>();
  for (const o of options) {
    const name = o.name.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    const bucket = byName.get(key) ?? { name, values: [] };
    const seen = new Set(bucket.values.map((v) => v.value.toLowerCase()));
    for (const v of o.values) {
      const value = v.value.trim();
      if (!value || seen.has(value.toLowerCase())) continue;
      seen.add(value.toLowerCase());
      bucket.values.push({ value, hex: v.hex });
    }
    byName.set(key, bucket);
  }
  const clean = [...byName.values()].filter((o) => o.values.length);
  if (!clean.length) return [];

  let sets: Record<string, string>[] = [{}];
  for (const o of clean) {
    sets = sets.flatMap((s) => o.values.map((v) => ({ ...s, [o.name]: v.value })));
  }

  const existing = new Map(previous.map((c) => [comboKey(c.options), c]));
  return dedupeCombos(
    sets.map((set) => {
      const old = existing.get(comboKey(set));
      return {
        id: old?.id,
        label: Object.values(set).join(" / "),
        options: set,
        price_override: old?.price_override ?? null,
        stock: old?.stock ?? 0,
        image: old?.image ?? null,
      };
    })
  );
}

export default function ProductForm({ models, product }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(product?.title ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [dimension, setDimension] = useState(product?.dimension ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [stock, setStock] = useState(product?.stock?.toString() ?? "0");
  const [image, setImage] = useState<string | null>(product?.image ?? null);
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [modelIds, setModelIds] = useState<string[]>(
    product?.product_models?.map((pm) => pm.model_id) ?? []
  );
  const [options, setOptions] = useState<ProductOption[]>(product?.options ?? []);
  // Stale DB duplicates (from the old buggy generator) collapse right here,
  // on load — saving once cleans the data permanently.
  const [combos, setCombos] = useState<ComboDraft[]>(() =>
    dedupeCombos(
      (product?.product_variants ?? []).map((v: ProductVariant) => ({
        id: v.id,
        label: v.label,
        options: v.options,
        price_override: v.price_override,
        stock: v.stock,
        image: v.image,
      }))
    )
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Combinations follow the options automatically — no "generate" button.
  const skipFirstSync = useRef(true);
  useEffect(() => {
    if (skipFirstSync.current) {
      skipFirstSync.current = false;
      return;
    }
    setCombos((prev) => buildCombos(options, prev));
  }, [options]);

  const hasOptions = options.some((o) => o.name.trim() && o.values.some((v) => v.value.trim()));
  const totalStock = useMemo(
    () => (hasOptions ? combos.reduce((n, c) => n + (c.stock || 0), 0) : Number(stock) || 0),
    [hasOptions, combos, stock]
  );

  // ---------- option editing ----------
  const addOption = () =>
    setOptions((prev) => [...prev, { name: prev.length === 0 ? "Color" : "", values: [] }]);
  const removeOption = (i: number) =>
    setOptions((prev) => prev.filter((_, x) => x !== i));
  const renameOption = (i: number, name: string) =>
    setOptions((prev) => prev.map((o, x) => (x === i ? { ...o, name } : o)));
  const addValue = (i: number) =>
    setOptions((prev) =>
      prev.map((o, x) =>
        x === i
          ? { ...o, values: [...o.values, isColor(o.name) ? { value: "", hex: "#" } : { value: "" }] }
          : o
      )
    );
  const updateValue = (i: number, vi: number, patch: Partial<{ value: string; hex: string }>) =>
    setOptions((prev) =>
      prev.map((o, x) =>
        x === i
          ? { ...o, values: o.values.map((v, vx) => (vx === vi ? { ...v, ...patch } : v)) }
          : o
      )
    );
  const removeValue = (i: number, vi: number) =>
    setOptions((prev) =>
      prev.map((o, x) =>
        x === i ? { ...o, values: o.values.filter((_, vx) => vx !== vi) } : o
      )
    );

  const updateCombo = (i: number, patch: Partial<ComboDraft>) =>
    setCombos((prev) => prev.map((c, x) => (x === i ? { ...c, ...patch } : c)));

  // ---------- save ----------
  async function save() {
    setSaving(true);
    setError(null);
    try {
      if (!title.trim() || !price) throw new Error("Title and price are required.");
      if (modelIds.length === 0)
        throw new Error("Pick at least one model this accessory fits.");
      for (const o of options) {
        if (!o.name.trim()) continue;
        if (isColor(o.name)) {
          for (const v of o.values) {
            if (v.value.trim() && !HEX.test(v.hex ?? ""))
              throw new Error(`Color "${v.value}" needs a valid hex like #FF5A1F.`);
          }
        }
      }

      const finalCombos = dedupeCombos(combos);

      const payload = {
        product: {
          title: title.trim(),
          slug: product?.slug ?? slugify(title),
          description: description.trim() || null,
          dimension: dimension.trim() || null,
          price: Number(price),
          stock: Number(stock) || 0,
          image,
          options: options
            .map((o) => ({
              name: o.name.trim(),
              values: o.values
                .map((v) => ({ ...v, value: v.value.trim() }))
                .filter((v) => v.value),
            }))
            .filter((o) => o.name && o.values.length),
          is_active: isActive,
          updated_at: new Date().toISOString(),
        },
        modelIds,
        variants: hasOptions
          ? finalCombos.map((c) => ({
              label: c.label,
              options: c.options,
              price_override: c.price_override,
              stock: c.stock || 0,
              image: c.image,
            }))
          : [],
      };

      const url = product ? `/api/admin/products/${product.id}` : "/api/admin/products";
      const res = await fetch(url, {
        method: product ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save the product.");

      router.push("/admin/products");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the product.");
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {product ? "Edit product" : "Add product"}
        </h1>
        <Badge variant={totalStock > 0 ? "default" : "destructive"}>
          Total stock: {totalStock}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Base price (₹)</Label>
            <Input
              id="price"
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ""))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dimension">Dimension</Label>
            <Input
              id="dimension"
              placeholder="66.9 X 50 X 20"
              value={dimension}
              onChange={(e) => setDimension(e.target.value)}
            />
          </div>
          {!hasOptions && (
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                inputMode="numeric"
                value={stock}
                onChange={(e) => setStock(e.target.value.replace(/\D/g, ""))}
              />
            </div>
          )}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Primary image</Label>
            <ImageUploader value={image} onChange={setImage} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fits these models</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {models.map((m) => (
            <Button
              key={m.id}
              type="button"
              size="sm"
              variant={modelIds.includes(m.id) ? "default" : "outline"}
              onClick={() =>
                setModelIds((prev) =>
                  prev.includes(m.id) ? prev.filter((x) => x !== m.id) : [...prev, m.id]
                )
              }
            >
              {m.name}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Options</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addOption}>
            <Plus size={14} /> Add option
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {options.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Optional. Add an option like <strong>Color</strong> (values need a
              hex code, e.g. Black #111111) or <strong>Size</strong> (S / M / L).
              The inventory list below updates by itself as you type.
            </p>
          )}

          {options.map((o, i) => (
            <div key={i} className="space-y-2 rounded-md border p-3">
              <div className="flex items-center gap-2">
                <Input
                  className="w-40"
                  placeholder="Option name (Color, Size…)"
                  value={o.name}
                  onChange={(e) => renameOption(i, e.target.value)}
                />
                <Button type="button" variant="ghost" size="sm" onClick={() => addValue(i)}>
                  <Plus size={14} /> Value
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ml-auto"
                  aria-label="Remove option"
                  onClick={() => removeOption(i)}
                >
                  <Trash2 size={16} className="text-destructive" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {o.values.map((v, vi) => (
                  <div key={vi} className="flex items-center gap-1 rounded-md border px-2 py-1">
                    <Input
                      className="h-8 w-24 border-0 px-1"
                      placeholder="Value"
                      value={v.value}
                      onChange={(e) => updateValue(i, vi, { value: e.target.value })}
                    />
                    {isColor(o.name) && (
                      <>
                        <span
                          aria-hidden
                          className="h-5 w-5 shrink-0 rounded-full border"
                          style={{ background: HEX.test(v.hex ?? "") ? v.hex : "transparent" }}
                        />
                        <Input
                          className={`h-8 w-24 px-1 ${
                            v.hex && v.hex !== "#" && !HEX.test(v.hex) ? "border-destructive" : ""
                          }`}
                          placeholder="#FF5A1F"
                          value={v.hex ?? ""}
                          onChange={(e) => updateValue(i, vi, { hex: e.target.value.trim() })}
                        />
                      </>
                    )}
                    <button
                      type="button"
                      aria-label="Remove value"
                      onClick={() => removeValue(i, vi)}
                    >
                      <X size={14} className="text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {hasOptions && combos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Inventory per combination</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="hidden gap-2 px-3 text-xs font-medium text-muted-foreground sm:grid sm:grid-cols-[1fr_6rem_7rem_auto_auto]">
              <span>Variant</span>
              <span>Stock</span>
              <span>Price (opt.)</span>
              <span>Image (opt.)</span>
              <span />
            </div>
            {combos.map((c, i) => (
              <div
                key={comboKey(c.options)}
                className="grid items-center gap-2 rounded-md border p-3 sm:grid-cols-[1fr_6rem_7rem_auto_auto]"
              >
                <div className="flex items-center gap-2 font-medium">
                  {c.label}
                  {c.stock <= 0 && <Badge variant="destructive">Out of stock</Badge>}
                </div>
                <Input
                  inputMode="numeric"
                  aria-label={`Stock for ${c.label}`}
                  value={c.stock}
                  onChange={(e) =>
                    updateCombo(i, { stock: Number(e.target.value.replace(/\D/g, "")) || 0 })
                  }
                />
                <Input
                  inputMode="numeric"
                  placeholder={`₹${price || "base"}`}
                  aria-label={`Price override for ${c.label}`}
                  value={c.price_override ?? ""}
                  onChange={(e) =>
                    updateCombo(i, {
                      price_override: e.target.value
                        ? Number(e.target.value.replace(/[^\d.]/g, ""))
                        : null,
                    })
                  }
                />
                <ImageUploader
                  value={c.image}
                  folder="/variants"
                  onChange={(url) => updateCombo(i, { image: url })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${c.label}`}
                  onClick={() => setCombos((prev) => prev.filter((_, x) => x !== i))}
                >
                  <Trash2 size={16} className="text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[hsl(var(--primary))]"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Visible in store
        </label>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button disabled={saving} onClick={save}>
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        {saving ? "Saving…" : "Save product"}
      </Button>
    </div>
  );
}