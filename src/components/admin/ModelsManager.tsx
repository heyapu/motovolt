"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ImageUploader from "@/components/admin/ImageUploader";
import type { Model } from "@/types";

// One editable card per vehicle model. Add a new one and every product's
// "Fits these models" picker + the storefront toggle update automatically.
export default function ModelsManager({ models }: { models: Model[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Vehicle models</h1>
      <p className="text-sm text-muted-foreground">
        Each model gets its own tab, banner and product grid on the store.
        Deactivate a model to hide its tab without deleting anything.
      </p>

      <NewModelCard onError={setError} onSaved={() => router.refresh()} />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {models.map((m) => (
          <ModelCard key={m.id} model={m} onError={setError} onSaved={() => router.refresh()} />
        ))}
      </div>
    </div>
  );
}

function NewModelCard({
  onError,
  onSaved,
}: {
  onError: (e: string | null) => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [bannerTitle, setBannerTitle] = useState("");
  const [busy, setBusy] = useState(false);

  async function add() {
    setBusy(true);
    onError(null);
    const res = await fetch("/api/admin/models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, banner_title: bannerTitle }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return onError(data.error ?? "Could not add model.");
    setName("");
    setBannerTitle("");
    onSaved();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus size={18} /> Add a model
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-end gap-3">
        <div className="space-y-2">
          <Label htmlFor="m-name">Name</Label>
          <Input
            id="m-name"
            placeholder="e.g. URBN Pro"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="min-w-64 flex-1 space-y-2">
          <Label htmlFor="m-banner">Banner headline (optional)</Label>
          <Input
            id="m-banner"
            placeholder="Everything Your Ride Needs."
            value={bannerTitle}
            onChange={(e) => setBannerTitle(e.target.value)}
          />
        </div>
        <Button disabled={busy || !name.trim()} onClick={add}>
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Add
        </Button>
      </CardContent>
    </Card>
  );
}

function ModelCard({
  model,
  onError,
  onSaved,
}: {
  model: Model;
  onError: (e: string | null) => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(model.name);
  const [bannerTitle, setBannerTitle] = useState(model.banner_title ?? "");
  const [bannerImage, setBannerImage] = useState<string | null>(model.banner_image);
  const [sortOrder, setSortOrder] = useState(String(model.sort_order));
  const [isActive, setIsActive] = useState(model.is_active);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    onError(null);
    const res = await fetch(`/api/admin/models/${model.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        banner_title: bannerTitle,
        banner_image: bannerImage,
        sort_order: Number(sortOrder) || 0,
        is_active: isActive,
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return onError(data.error ?? "Could not save model.");
    onSaved();
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>{model.name}</CardTitle>
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Live" : "Hidden"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Banner headline</Label>
          <Input value={bannerTitle} onChange={(e) => setBannerTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Banner image</Label>
          <ImageUploader value={bannerImage} folder="/banners" onChange={setBannerImage} />
        </div>
        <div className="flex items-end gap-3">
          <div className="w-24 space-y-2">
            <Label>Order</Label>
            <Input
              inputMode="numeric"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          <label className="flex h-10 items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[hsl(var(--primary))]"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Visible in store
          </label>
          <Button className="ml-auto" size="sm" disabled={busy} onClick={save}>
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
