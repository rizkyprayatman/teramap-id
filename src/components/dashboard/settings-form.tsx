"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, Building2, FileSignature, Upload, Image as ImageIcon } from "lucide-react";
import { updateOrganization } from "@/actions/organization";
import { ORGANIZATION_TYPE_LABELS } from "@/lib/constants";
import { LocationPicker } from "@/components/dashboard/location-picker";

interface Organization {
  id: string;
  name: string;
  type: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  street: string | null;
  village: string | null;
  district: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  defaultTeraValidity: number;
  signatureName: string | null;
  signatureTitle: string | null;
  signatureName2: string | null;
  signatureTitle2: string | null;
  signatureName3: string | null;
  signatureTitle3: string | null;
  letterNumberPrefix: string | null;
  letterNumberMiddle: string | null;
  letterNumberSuffix: string | null;
}

export function SettingsForm({ org }: { org: Organization }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [logoUrl, setLogoUrl] = useState(org.logoUrl || "");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran logo maks. 2MB");
      return;
    }

    setIsUploadingLogo(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "logos");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setLogoUrl(result.url);
    } catch (err: any) {
      setError(err.message || "Gagal upload logo");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSubmit = (formData: FormData) => {
    setError("");
    setSuccess(false);
    if (logoUrl) formData.set("logoUrl", logoUrl);
    startTransition(async () => {
      const result = await updateOrganization(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg">
          Pengaturan berhasil disimpan!
        </div>
      )}

      {/* Organization Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Informasi Organisasi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Logo Upload */}
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden bg-muted/50">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <Label className="cursor-pointer">
                <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                  {isUploadingLogo ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {logoUrl ? "Ganti Logo" : "Upload Logo"}
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleLogoUpload}
                  disabled={isUploadingLogo}
                />
              </Label>
              <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WebP. Maks. 2MB</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Organisasi *</Label>
              <Input id="name" name="name" defaultValue={org.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipe Organisasi</Label>
              <Select name="type" defaultValue={org.type}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ORGANIZATION_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={org.email || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telepon</Label>
              <Input id="phone" name="phone" defaultValue={org.phone || ""} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="street">Alamat</Label>
            <Input
              id="street"
              name="street"
              defaultValue={org.street || org.address || ""}
              placeholder="Nama jalan, nomor, RT/RW"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="village">Desa/Kelurahan</Label>
              <Input
                id="village"
                name="village"
                defaultValue={org.village || ""}
                placeholder="Kelurahan atau desa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">Kecamatan</Label>
              <Input
                id="district"
                name="district"
                defaultValue={org.district || ""}
                placeholder="Kecamatan"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Kabupaten/Kota</Label>
              <Input
                id="city"
                name="city"
                defaultValue={org.city || ""}
                placeholder="Kabupaten atau kota"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="province">Provinsi</Label>
              <Input
                id="province"
                name="province"
                defaultValue={org.province || ""}
                placeholder="Provinsi"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="postalCode">Kode Pos</Label>
              <Input
                id="postalCode"
                name="postalCode"
                defaultValue={org.postalCode || ""}
                placeholder="Kode pos"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <LocationPicker
              defaultLat={org.latitude}
              defaultLng={org.longitude}
              onLocationChange={() => {}}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Koordinat ini dipakai sebagai lokasi default saat menambah alat UTTP.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tera Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Tera & Nomor Surat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="defaultTeraValidity">Masa Berlaku Tera Default (hari)</Label>
              <Input
                id="defaultTeraValidity"
                name="defaultTeraValidity"
                type="number"
                min={1}
                max={3650}
                defaultValue={org.defaultTeraValidity}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="letterNumberPrefix">Prefix Nomor Surat</Label>
              <Input
                id="letterNumberPrefix"
                name="letterNumberPrefix"
                defaultValue={org.letterNumberPrefix || ""}
                placeholder="Contoh: TERA"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="letterNumberMiddle">Bagian Tengah Nomor Surat</Label>
              <Input
                id="letterNumberMiddle"
                name="letterNumberMiddle"
                defaultValue={org.letterNumberMiddle || ""}
                placeholder="Contoh: DINAS-MET"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="letterNumberSuffix">Suffix Nomor Surat</Label>
              <Input
                id="letterNumberSuffix"
                name="letterNumberSuffix"
                defaultValue={org.letterNumberSuffix || ""}
                placeholder="Contoh: KAB-BDG"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground bg-blue-50 border border-blue-200 rounded p-2">
            Format: [nomor urut]/[prefix]/[tengah]/[bulan]/[tahun]/[suffix]<br/>
            Contoh: 001/TERA/DINAS-MET/01/2024/KAB-BDG
          </p>
        </CardContent>
      </Card>

      {/* Signatures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            Tanda Tangan Dokumen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Signatory 1 */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3">Penandatangan 1 (Utama)</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="signatureName">Nama</Label>
                <Input
                  id="signatureName"
                  name="signatureName"
                  defaultValue={org.signatureName || ""}
                  placeholder="Nama lengkap"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signatureTitle">Jabatan</Label>
                <Input
                  id="signatureTitle"
                  name="signatureTitle"
                  defaultValue={org.signatureTitle || ""}
                  placeholder="Contoh: Kepala Bidang Metrologi"
                />
              </div>
            </div>
          </div>

          {/* Signatory 2 */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3">Penandatangan 2 (Opsional)</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="signatureName2">Nama</Label>
                <Input
                  id="signatureName2"
                  name="signatureName2"
                  defaultValue={org.signatureName2 || ""}
                  placeholder="Nama lengkap"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signatureTitle2">Jabatan</Label>
                <Input
                  id="signatureTitle2"
                  name="signatureTitle2"
                  defaultValue={org.signatureTitle2 || ""}
                  placeholder="Jabatan"
                />
              </div>
            </div>
          </div>

          {/* Signatory 3 */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3">Penandatangan 3 (Opsional)</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="signatureName3">Nama</Label>
                <Input
                  id="signatureName3"
                  name="signatureName3"
                  defaultValue={org.signatureName3 || ""}
                  placeholder="Nama lengkap"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signatureTitle3">Jabatan</Label>
                <Input
                  id="signatureTitle3"
                  name="signatureTitle3"
                  defaultValue={org.signatureTitle3 || ""}
                  placeholder="Jabatan"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Simpan Pengaturan
        </Button>
      </div>
    </form>
  );
}
