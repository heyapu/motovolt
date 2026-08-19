"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Trash2, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import type { AdminRow } from "@/types";

interface Props {
  admins: AdminRow[];
  myEmail: string;
}

export default function AdminsManager({ admins, myEmail }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "superadmin">("admin");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addAdmin() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Could not add admin.");
    setEmail("");
    router.refresh();
  }

  async function removeAdmin(target: string) {
    if (!confirm(`Remove ${target} from admins?`)) return;
    const res = await fetch(`/api/admin/admins?email=${encodeURIComponent(target)}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error ?? "Could not remove admin.");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admins</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus size={18} /> Add an admin
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div className="min-w-64 space-y-2">
            <Label htmlFor="new-email">Email</Label>
            <Input
              id="new-email"
              type="email"
              placeholder="teammate@motovolt.co"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-role">Role</Label>
            <select
              id="new-role"
              className="flex h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value as "admin" | "superadmin")}
            >
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>
          <Button disabled={busy || !email.includes("@")} onClick={addAdmin}>
            {busy ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
            Add
          </Button>
          {error && <p className="w-full text-sm text-destructive">{error}</p>}
          <p className="w-full text-xs text-muted-foreground">
            They sign in at <code>/admin</code> with this email via Kinde (Google
            or email OTP — whatever you enabled in Kinde). Anyone not on this
            list is denied even if they authenticate.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Added by</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">
                    {a.email}
                    {a.email.toLowerCase() === myEmail.toLowerCase() && (
                      <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={a.role === "superadmin" ? "default" : "secondary"}>
                      {a.role === "superadmin" && <ShieldCheck size={12} className="mr-1" />}
                      {a.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{a.added_by ?? "—"}</TableCell>
                  <TableCell>
                    {a.email.toLowerCase() !== myEmail.toLowerCase() && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove ${a.email}`}
                        onClick={() => removeAdmin(a.email)}
                      >
                        <Trash2 size={16} className="text-destructive" />
                      </Button>
                    )}
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
