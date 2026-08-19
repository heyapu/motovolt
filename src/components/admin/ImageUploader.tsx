"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  value: string | null;
  folder?: string;
  onChange: (url: string | null) => void;
}

// Direct browser → ImageKit upload; signed credentials come from
// /api/imagekit/auth (admin-only).
export default function ImageUploader({ value, folder = "/products", onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const auth = await fetch("/api/imagekit/auth").then((r) => {
        if (!r.ok) throw new Error("Not authorised to upload.");
        return r.json();
      });

      const form = new FormData();
      form.append("file", file);
      form.append("fileName", file.name);
      form.append("folder", folder);
      form.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!);
      form.append("signature", auth.signature);
      form.append("expire", String(auth.expire));
      form.append("token", auth.token);

      const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Upload failed.");
      onChange(data.url as string);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {value && (
        <div className="relative h-16 w-16 overflow-hidden rounded-md border bg-secondary">
          <Image src={value} alt="Uploaded" fill sizes="64px" className="object-contain" />
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
        {busy ? "Uploading…" : value ? "Replace" : "Upload image"}
      </Button>
      {value && (
        <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
          <X size={14} /> Remove
        </Button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = "";
        }}
      />
      {error && <p className="w-full text-xs text-destructive">{error}</p>}
    </div>
  );
}
