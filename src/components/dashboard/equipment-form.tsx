"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowLeft } from "lucide-react";
import { createEquipment, updateEquipment } from "@/actions/equipment";
import { EQUIPMENT_TYPES } from "@/lib/constants";
import { CameraCapture } from "@/components/dashboard/camera-capture";
import { LocationPicker } from "@/components/dashboard/location-picker";
import Link from "next/link";

interface EquipmentFormProps {
  mode: "create" | "edit";
  orgDefaultLat?: number | null;
  orgDefaultLng?: number | null;
  defaultValues?: {
    id: string;
    name: string;
    type: string;
    brand: string | null;
    model: string | null;
    serialNumber: string;
    capacity: string | null;
    divisionValue: string | null;
    ownerName: string | null;
    businessName: string | null;
    latitude: number | null;
    longitude: number | null;
    address: string | null;
    street: string | null;
    village: string | null;
    district: string | null;
    city: string | null;
    province: string | null;
    postalCode: string | null;
    photoUrl: string | null;
    photos: string[];
  };
}

export function EquipmentForm({ mode, defaultValues, orgDefaultLat, orgDefaultLng }: EquipmentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<string[]>(defaultValues?.photos || []);
  const [lat, setLat] = useState<number | null>(
    defaultValues?.latitude ?? orgDefaultLat ?? null
  );
  const [lng, setLng] = useState<number | null>(
    defaultValues?.longitude ?? orgDefaultLng ?? null
  );

  const handleLocationChange = useCallback((newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
  }, []);

  const handleSubmit = (formData: FormData) => {
    setError("");
    // Inject photos and location
    if (photos.length > 0) {
      formData.set("photoUrl", photos[0]);
      formData.set("photos", JSON.stringify(photos));
    }
    if (lat !== null) formData.set("latitude", lat.toString());
    if (lng !== null) formData.set("longitude", lng.toString());

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createEquipment(formData)
          : await updateEquipment(defaultValues!.id, formData);

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/dashboard/equipment");
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/equipment">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">
          {mode === "create" ? "Tambah Alat Baru" : "Edit Alat"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Alat</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Alat *</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  defaultValue={defaultValues?.name}
                  placeholder="Contoh: Timbangan Digital A"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Jenis Alat *</Label>
                <Select name="type" defaultValue={defaultValues?.type}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis alat" />
                  </SelectTrigger>
                  <SelectContent>
                    {EQUIPMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Merek</Label>
                <Input
                  id="brand"
                  name="brand"
                  defaultValue={defaultValues?.brand || ""}
                  placeholder="Merek alat"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  name="model"
                  defaultValue={defaultValues?.model || ""}
                  placeholder="Model alat"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serialNumber">Nomor Seri *</Label>
                <Input
                  id="serialNumber"
                  name="serialNumber"
                  required
                  defaultValue={defaultValues?.serialNumber}
                  placeholder="Nomor seri unik"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Kapasitas</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  defaultValue={defaultValues?.capacity || ""}
                  placeholder="Contoh: 100 kg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="divisionValue">Nilai Skala</Label>
                <Input
                  id="divisionValue"
                  name="divisionValue"
                  defaultValue={defaultValues?.divisionValue || ""}
                  placeholder="Contoh: 0.01 kg"
                />
              </div>
            </div>

            {/* Owner/Business Info */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Pemilik (Opsional)</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Nama Pemilik</Label>
                  <Input
                    id="ownerName"
                    name="ownerName"
                    defaultValue={defaultValues?.ownerName || ""}
                    placeholder="Nama pemilik alat"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Nama Usaha</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    defaultValue={defaultValues?.businessName || ""}
                    placeholder="Nama usaha/toko"
                  />
                </div>
              </div>
            </div>

            {/* Photos */}
            <div className="border-t pt-4">
              <CameraCapture
                maxPhotos={2}
                existingPhotos={defaultValues?.photos || []}
                onPhotosChange={setPhotos}
                folder="equipment"
                label="Foto Alat"
              />
            </div>

            {/* Location Picker */}
            <div className="border-t pt-4">
              <LocationPicker
                defaultLat={defaultValues?.latitude ?? orgDefaultLat}
                defaultLng={defaultValues?.longitude ?? orgDefaultLng}
                onLocationChange={handleLocationChange}
              />

              <h3 className="font-semibold mt-4 mb-3">Alamat Lokasi</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="street">Jalan / Alamat</Label>
                  <Input
                    id="street"
                    name="street"
                    defaultValue={defaultValues?.street || ""}
                    placeholder="Nama jalan, nomor, RT/RW"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="village">Kelurahan / Desa</Label>
                  <Input
                    id="village"
                    name="village"
                    defaultValue={defaultValues?.village || ""}
                    placeholder="Kelurahan atau desa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">Kecamatan</Label>
                  <Input
                    id="district"
                    name="district"
                    defaultValue={defaultValues?.district || ""}
                    placeholder="Kecamatan"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Kabupaten / Kota</Label>
                  <Input
                    id="city"
                    name="city"
                    defaultValue={defaultValues?.city || ""}
                    placeholder="Kabupaten atau kota"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Provinsi</Label>
                  <Input
                    id="province"
                    name="province"
                    defaultValue={defaultValues?.province || ""}
                    placeholder="Provinsi"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Kode Pos</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    defaultValue={defaultValues?.postalCode || ""}
                    placeholder="Kode pos"
                  />
                </div>
              </div>

              {/* Hidden combined address for backward compatibility */}
              <input type="hidden" name="address" value={
                [
                  defaultValues?.street,
                  defaultValues?.village,
                  defaultValues?.district,
                  defaultValues?.city,
                  defaultValues?.province,
                  defaultValues?.postalCode,
                ].filter(Boolean).join(", ") || defaultValues?.address || ""
              } />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link href="/dashboard/equipment">
                <Button variant="outline" type="button">Batal</Button>
              </Link>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "create" ? "Simpan" : "Update"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
