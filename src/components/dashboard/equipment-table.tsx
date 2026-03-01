"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Trash2, Eye, Edit, Loader2 } from "lucide-react";
import { deleteEquipment } from "@/actions/equipment";
import { formatDate } from "@/lib/utils";

interface Equipment {
  id: string;
  name: string;
  type: string;
  brand: string | null;
  serialNumber: string;
  barcode: string;
  status: string;
  teraExpiryDate: string | Date | null;
  lastTeraDate: string | Date | null;
  address: string | null;
  _count: { teraHistories: number };
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  ACTIVE: { label: "Aktif", variant: "default" },
  EXPIRED: { label: "Expired", variant: "destructive" },
  PENDING: { label: "Bersyarat", variant: "secondary" },
  SUSPENDED: { label: "Ditangguhkan", variant: "outline" },
};

export function EquipmentTable({ initialData }: { initialData: Equipment[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Extract unique types
  const types = Array.from(new Set(initialData.map((e) => e.type))).sort();

  const filtered = initialData.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      e.barcode.toLowerCase().includes(search.toLowerCase()) ||
      e.type.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || e.status === statusFilter;
    const matchType = typeFilter === "ALL" || e.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteEquipment(id);
      setDeleteId(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex flex-1 gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari alat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="ACTIVE">Aktif</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
              <SelectItem value="PENDING">Bersyarat</SelectItem>
              <SelectItem value="SUSPENDED">Ditangguhkan</SelectItem>
            </SelectContent>
          </Select>
          {types.length > 1 && (
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Jenis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Jenis</SelectItem>
                {types.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <Link href="/dashboard/equipment/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Alat
          </Button>
        </Link>
      </div>

      <p className="text-sm text-muted-foreground">
        Menampilkan {filtered.length} dari {initialData.length} alat
      </p>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Alat</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>No. Seri</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expired</TableHead>
                <TableHead>Tera</TableHead>
                <TableHead className="w-[100px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {search ? "Tidak ada alat ditemukan" : "Belum ada alat terdaftar"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((eq) => {
                  const status = statusMap[eq.status] || statusMap.ACTIVE;
                  return (
                    <TableRow key={eq.id}>
                      <TableCell className="font-medium">{eq.name}</TableCell>
                      <TableCell>{eq.type}</TableCell>
                      <TableCell className="font-mono text-xs">{eq.serialNumber}</TableCell>
                      <TableCell className="font-mono text-xs">{eq.barcode}</TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        {eq.teraExpiryDate ? formatDate(new Date(eq.teraExpiryDate)) : "-"}
                      </TableCell>
                      <TableCell>{eq._count.teraHistories}x</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Link href={`/dashboard/equipment/${eq.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/dashboard/equipment/${eq.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Dialog open={deleteId === eq.id} onOpenChange={(open) => !open && setDeleteId(null)}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => setDeleteId(eq.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Hapus Alat</DialogTitle>
                              </DialogHeader>
                              <p className="text-sm text-muted-foreground">
                                Apakah Anda yakin ingin menghapus <strong>{eq.name}</strong>?
                                Semua riwayat tera akan ikut terhapus.
                              </p>
                              <div className="flex justify-end gap-2 mt-4">
                                <Button variant="outline" onClick={() => setDeleteId(null)}>
                                  Batal
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleDelete(eq.id)}
                                  disabled={isPending}
                                >
                                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  Hapus
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
