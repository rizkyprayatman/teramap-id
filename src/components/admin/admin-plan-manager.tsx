"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Loader2, CheckCircle, Star } from "lucide-react";
import { createPlan, updatePlan, deletePlan } from "@/actions/plans";

interface Plan {
  id: string;
  name: string;
  slug: string;
  monthlyPrice: number;
  quarterlyPrice: number;
  semiAnnualPrice: number;
  annualPrice: number;
  equipmentLimit: number;
  userLimit: number;
  description: string | null;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
}

export function AdminPlanManager({ plans }: { plans: Plan[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = editingPlan
        ? await updatePlan(editingPlan.id, formData)
        : await createPlan(formData);

      if (result.error) {
        setError(result.error);
      } else {
        setDialogOpen(false);
        setEditingPlan(null);
        router.refresh();
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Yakin ingin menghapus plan ini?")) return;
    startTransition(async () => {
      const result = await deletePlan(id);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  };

  const openEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setError("");
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingPlan(null);
    setError("");
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingPlan(null); }}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPlan ? "Edit Plan" : "Tambah Plan Baru"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">{error}</div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Plan</Label>
                  <Input id="name" name="name" defaultValue={editingPlan?.name || ""} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" name="slug" defaultValue={editingPlan?.slug || ""} placeholder="auto-generate" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthlyPrice">Harga Bulanan (Rp)</Label>
                  <Input id="monthlyPrice" name="monthlyPrice" type="number" defaultValue={editingPlan?.monthlyPrice || 0} min={0} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quarterlyPrice">Harga 3 Bulan (Rp)</Label>
                  <Input id="quarterlyPrice" name="quarterlyPrice" type="number" defaultValue={editingPlan?.quarterlyPrice || 0} min={0} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semiAnnualPrice">Harga 6 Bulan (Rp)</Label>
                  <Input id="semiAnnualPrice" name="semiAnnualPrice" type="number" defaultValue={editingPlan?.semiAnnualPrice || 0} min={0} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annualPrice">Harga 12 Bulan (Rp)</Label>
                  <Input id="annualPrice" name="annualPrice" type="number" defaultValue={editingPlan?.annualPrice || 0} min={0} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="equipmentLimit">Limit Alat</Label>
                  <Input id="equipmentLimit" name="equipmentLimit" type="number" defaultValue={editingPlan?.equipmentLimit || 10} min={1} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userLimit">Limit Pengguna</Label>
                  <Input id="userLimit" name="userLimit" type="number" defaultValue={editingPlan?.userLimit || 2} min={1} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Input id="description" name="description" defaultValue={editingPlan?.description || ""} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="features">Fitur (satu per baris)</Label>
                <Textarea
                  id="features"
                  name="features"
                  rows={6}
                  defaultValue={editingPlan ? (Array.isArray(editingPlan.features) ? editingPlan.features.join("\n") : "") : ""}
                  placeholder="Maks. 10 alat UTTP&#10;2 pengguna&#10;Barcode & scanner"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center justify-between border rounded-lg p-3">
                  <Label htmlFor="isPopular" className="text-sm">Populer</Label>
                  <input type="hidden" name="isPopular" value={editingPlan?.isPopular ? "true" : "false"} />
                  <Switch
                    id="isPopular"
                    defaultChecked={editingPlan?.isPopular || false}
                    onCheckedChange={(v) => {
                      const input = document.querySelector('input[name="isPopular"]') as HTMLInputElement;
                      if (input) input.value = v ? "true" : "false";
                    }}
                  />
                </div>
                <div className="flex items-center justify-between border rounded-lg p-3">
                  <Label htmlFor="isActive" className="text-sm">Aktif</Label>
                  <input type="hidden" name="isActive" value={editingPlan?.isActive !== false ? "true" : "false"} />
                  <Switch
                    id="isActive"
                    defaultChecked={editingPlan?.isActive !== false}
                    onCheckedChange={(v) => {
                      const input = document.querySelector('input[name="isActive"]') as HTMLInputElement;
                      if (input) input.value = v ? "true" : "false";
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Urutan</Label>
                  <Input id="sortOrder" name="sortOrder" type="number" defaultValue={editingPlan?.sortOrder || 0} min={0} />
                </div>
              </div>

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</>
                ) : (
                  <><CheckCircle className="mr-2 h-4 w-4" />{editingPlan ? "Perbarui" : "Simpan"}</>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {plans.map((plan) => {
          const features: string[] = Array.isArray(plan.features) ? plan.features : [];
          return (
            <Card key={plan.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    {plan.isPopular && (
                      <Badge variant="default" className="gap-1">
                        <Star className="h-3 w-3" /> Populer
                      </Badge>
                    )}
                    {!plan.isActive && <Badge variant="secondary">Nonaktif</Badge>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(plan)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDelete(plan.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-muted-foreground">Bulanan</span>
                    <p className="font-bold">Rp {plan.monthlyPrice.toLocaleString("id-ID")}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">3 Bulan</span>
                    <p className="font-bold">Rp {plan.quarterlyPrice.toLocaleString("id-ID")}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">6 Bulan</span>
                    <p className="font-bold">Rp {plan.semiAnnualPrice.toLocaleString("id-ID")}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">12 Bulan</span>
                    <p className="font-bold">Rp {plan.annualPrice.toLocaleString("id-ID")}</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Limit: {plan.equipmentLimit >= 999999 ? "Unlimited" : plan.equipmentLimit} alat, {plan.userLimit >= 999999 ? "Unlimited" : plan.userLimit} user
                  {plan.description && <> &middot; {plan.description}</>}
                </div>
                {features.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {features.slice(0, 5).map((f, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{f}</Badge>
                    ))}
                    {features.length > 5 && (
                      <Badge variant="outline" className="text-xs">+{features.length - 5} lagi</Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {plans.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Belum ada plan. Klik &quot;Tambah Plan&quot; untuk menambahkan.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
