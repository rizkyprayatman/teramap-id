"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Edit,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Loader2,
  Barcode,
  Printer,
  User,
  Store,
  Image as ImageIcon,
} from "lucide-react";
import { addTeraHistory } from "@/actions/equipment";
import { formatDate } from "@/lib/utils";
import { CameraCapture } from "@/components/dashboard/camera-capture";

interface TeraHistory {
  id: string;
  testDate: string;
  result: string;
  officerName: string;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
  photoUrl: string | null;
  photos: string[];
}

interface Equipment {
  id: string;
  name: string;
  type: string;
  brand: string | null;
  model: string | null;
  serialNumber: string;
  barcode: string;
  capacity: string | null;
  divisionValue: string | null;
  ownerName: string | null;
  businessName: string | null;
  status: string;
  teraExpiryDate: string | null;
  lastTeraDate: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  photoUrl: string | null;
  photos: string[];
  createdAt: string;
  organization: { name: string };
  teraHistories: TeraHistory[];
}

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  ACTIVE: { label: "Aktif", icon: <CheckCircle2 className="h-4 w-4" />, color: "text-green-600" },
  EXPIRED: { label: "Expired", icon: <XCircle className="h-4 w-4" />, color: "text-red-600" },
  PENDING: { label: "Bersyarat", icon: <AlertTriangle className="h-4 w-4" />, color: "text-yellow-600" },
  SUSPENDED: { label: "Ditangguhkan", icon: <XCircle className="h-4 w-4" />, color: "text-gray-600" },
};

const resultConfig: Record<string, { label: string; variant: "default" | "destructive" | "secondary" }> = {
  PASS: { label: "Lulus", variant: "default" },
  FAIL: { label: "Tidak Lulus", variant: "destructive" },
  CONDITIONAL: { label: "Bersyarat", variant: "secondary" },
};

export function EquipmentDetail({ equipment }: { equipment: Equipment }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showTeraForm, setShowTeraForm] = useState(false);
  const [error, setError] = useState("");
  const [teraPhotos, setTeraPhotos] = useState<string[]>([]);
  const barcodeRef = useRef<HTMLDivElement>(null);

  const status = statusConfig[equipment.status] || statusConfig.ACTIVE;

  const handlePrintBarcode = () => {
    const printWindow = window.open("", "_blank", "width=400,height=300");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Barcode - ${equipment.barcode}</title>
        <style>
          body { margin: 0; padding: 20px; text-align: center; font-family: monospace; }
          .barcode-container { border: 2px dashed #ccc; padding: 20px; display: inline-block; }
          .barcode-text { font-size: 18px; font-weight: bold; letter-spacing: 3px; margin: 10px 0; }
          .equipment-name { font-size: 12px; color: #666; }
          .org-name { font-size: 11px; color: #999; margin-top: 4px; }
          @media print { .barcode-container { border: 2px solid #000; } }
        </style>
      </head>
      <body>
        <div class="barcode-container">
          <img src="https://bwipjs-api.metafloor.com/?bcid=code128&text=${equipment.barcode}&scale=3&height=15&includetext" alt="barcode" />
          <div class="barcode-text">${equipment.barcode}</div>
          <div class="equipment-name">${equipment.name} - ${equipment.type}</div>
          <div class="org-name">${equipment.organization.name}</div>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleAddTera = (formData: FormData) => {
    setError("");
    formData.set("equipmentId", equipment.id);
    if (teraPhotos.length > 0) {
      formData.set("photoUrl", teraPhotos[0]);
      formData.set("photos", JSON.stringify(teraPhotos));
    }
    startTransition(async () => {
      const result = await addTeraHistory(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setShowTeraForm(false);
        setTeraPhotos([]);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/equipment">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{equipment.name}</h1>
            <p className="text-muted-foreground">{equipment.type}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrintBarcode}>
            <Printer className="mr-2 h-4 w-4" />
            Cetak Barcode
          </Button>
          <Link href={`/dashboard/equipment/${equipment.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Status</p>
            <div className={`flex items-center gap-2 font-semibold ${status.color}`}>
              {status.icon}
              {status.label}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Barcode</p>
            <div className="flex items-center gap-2">
              <Barcode className="h-4 w-4" />
              <span className="font-mono text-sm">{equipment.barcode}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Tera Terakhir</p>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {equipment.lastTeraDate ? formatDate(new Date(equipment.lastTeraDate)) : "-"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Kadaluarsa</p>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {equipment.teraExpiryDate ? formatDate(new Date(equipment.teraExpiryDate)) : "-"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Alat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Merek</span>
              <span className="font-medium">{equipment.brand || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Model</span>
              <span className="font-medium">{equipment.model || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">No. Seri</span>
              <span className="font-mono text-sm">{equipment.serialNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kapasitas</span>
              <span className="font-medium">{equipment.capacity || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nilai Skala</span>
              <span className="font-medium">{equipment.divisionValue || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Organisasi</span>
              <span className="font-medium">{equipment.organization.name}</span>
            </div>
            {equipment.ownerName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" />Pemilik</span>
                <span className="font-medium">{equipment.ownerName}</span>
              </div>
            )}
            {equipment.businessName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1"><Store className="h-3 w-3" />Usaha</span>
                <span className="font-medium">{equipment.businessName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Terdaftar</span>
              <span className="font-medium">{formatDate(new Date(equipment.createdAt))}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Lokasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {equipment.latitude && equipment.longitude ? (
              <div className="space-y-2">
                <p className="text-sm">{equipment.address || "Alamat tidak tersedia"}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {equipment.latitude}, {equipment.longitude}
                </p>
                <a
                  href={`https://www.google.com/maps/@${equipment.latitude},${equipment.longitude},17z`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Buka di Google Maps →
                </a>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Lokasi belum diisi</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Photos */}
      {equipment.photos && equipment.photos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Foto Alat ({equipment.photos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {equipment.photos.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block">
                  <div className="aspect-square rounded-lg overflow-hidden border hover:ring-2 ring-primary transition-all">
                    <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tera History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Riwayat Tera</CardTitle>
          <Dialog open={showTeraForm} onOpenChange={setShowTeraForm}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Input Tera
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Input Hasil Tera</DialogTitle>
              </DialogHeader>
              <form action={handleAddTera} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="testDate">Tanggal Tera *</Label>
                  <Input
                    id="testDate"
                    name="testDate"
                    type="date"
                    required
                    defaultValue={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="result">Hasil *</Label>
                  <Select name="result" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih hasil tera" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PASS">Lulus / Sah</SelectItem>
                      <SelectItem value="FAIL">Tidak Lulus / Batal</SelectItem>
                      <SelectItem value="CONDITIONAL">Bersyarat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="officerName">Nama Petugas *</Label>
                  <Input id="officerName" name="officerName" required placeholder="Nama petugas penguji" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan</Label>
                  <Textarea id="notes" name="notes" placeholder="Catatan tambahan..." rows={3} />
                </div>
                <div>
                  <CameraCapture
                    maxPhotos={3}
                    onPhotosChange={setTeraPhotos}
                    folder="equipment"
                    label="Foto Hasil Tera"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowTeraForm(false)}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Hasil</TableHead>
                <TableHead>Petugas</TableHead>
                <TableHead>Catatan</TableHead>
                <TableHead>Foto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment.teraHistories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Belum ada riwayat tera
                  </TableCell>
                </TableRow>
              ) : (
                equipment.teraHistories.map((h) => {
                  const rc = resultConfig[h.result] || resultConfig.PASS;
                  return (
                    <TableRow key={h.id}>
                      <TableCell>{formatDate(new Date(h.testDate))}</TableCell>
                      <TableCell>
                        <Badge variant={rc.variant}>{rc.label}</Badge>
                      </TableCell>
                      <TableCell>{h.officerName}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {h.notes || "-"}
                      </TableCell>
                      <TableCell>
                        {h.photos && h.photos.length > 0 ? (
                          <div className="flex gap-1">
                            {h.photos.slice(0, 2).map((url, i) => (
                              <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                                <img src={url} alt={`Foto ${i + 1}`} className="h-8 w-8 rounded object-cover border hover:ring-2 ring-primary" />
                              </a>
                            ))}
                            {h.photos.length > 2 && (
                              <span className="text-xs text-muted-foreground self-center">+{h.photos.length - 2}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
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
