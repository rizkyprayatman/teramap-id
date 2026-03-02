"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings, Save, Loader2, CheckCircle, Store, CreditCard } from "lucide-react";
import { updateSystemSettings } from "@/actions/subscription";
import { parseEnabledPaymentChannels } from "@/lib/payment-channels";

const ALL_PAYMENT_CHANNELS = [
  // Credit Card
  { code: "VC", name: "Credit Card (Visa / Master Card / JCB)" },

  // Virtual Account
  { code: "BC", name: "BCA Virtual Account" },
  { code: "M2", name: "Mandiri Virtual Account" },
  { code: "VA", name: "Maybank Virtual Account" },
  { code: "I1", name: "BNI Virtual Account" },
  { code: "B1", name: "CIMB Niaga Virtual Account" },
  { code: "BT", name: "Permata Bank Virtual Account" },
  { code: "A1", name: "ATM Bersama" },
  { code: "AG", name: "Bank Artha Graha" },
  { code: "NC", name: "Bank Neo Commerce (BNC)" },
  { code: "BR", name: "BRIVA" },
  { code: "S1", name: "Bank Sahabat Sampoerna" },
  { code: "DM", name: "Danamon Virtual Account" },
  { code: "BV", name: "BSI Virtual Account" },

  // Ritel
  { code: "FT", name: "Pegadaian / ALFA / Pos" },
  { code: "IR", name: "Indomaret" },

  // E-Wallet
  { code: "OV", name: "OVO (Support Void)" },
  { code: "SA", name: "ShopeePay Apps (Support Void)" },
  { code: "LF", name: "LinkAja Apps (Fixed Fee)" },
  { code: "LA", name: "LinkAja Apps (Percentage Fee)" },
  { code: "DA", name: "DANA" },
  { code: "SL", name: "ShopeePay Account Link" },
  { code: "OL", name: "OVO Account Link" },

  // QRIS
  { code: "SP", name: "ShopeePay (QRIS)" },
  { code: "NQ", name: "Nobu (QRIS)" },
  { code: "GQ", name: "Gudang Voucher (QRIS)" },
  { code: "SQ", name: "Nusapay (QRIS)" },

  // Kredit / Paylater
  { code: "DN", name: "Indodana Paylater" },
  { code: "AT", name: "ATOME" },

  // E-Banking
  { code: "JP", name: "Jenius Pay" },

  // E-Commerce
  { code: "T1", name: "Tokopedia Card Payment" },
  { code: "T2", name: "Tokopedia E-Wallet" },
  { code: "T3", name: "Tokopedia Others" },
];

interface SystemSettings {
  id: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  subscriptionPrice: number;
  quarterlyPrice: number;
  semiAnnualPrice: number;
  annualPrice: number;
  defaultTeraValidity: number;
  maintenanceMode: boolean;
  merchantName: string | null;
  paymentInstructions: string | null;
  enabledPaymentChannels: string | null;
  createdAt: string;
  updatedAt: string;
}

export function AdminSettingsForm({ settings }: { settings: SystemSettings | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const parsedChannels: string[] = (() => {
    const parsed = parseEnabledPaymentChannels(settings?.enabledPaymentChannels);
    return parsed ?? ALL_PAYMENT_CHANNELS.map((c) => c.code);
  })();
  const [enabledChannels, setEnabledChannels] = useState<string[]>(parsedChannels);

  const toggleChannel = (code: string) => {
    setEnabledChannels((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateSystemSettings(formData);
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>
            Atur logo website dan favicon (URL gambar)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                name="logoUrl"
                defaultValue={settings?.logoUrl || ""}
                placeholder="https://.../logo.png"
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">
                Dipakai untuk logo di landing/auth/sidebar. Kosongkan untuk memakai logo default.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="faviconUrl">Favicon URL</Label>
              <Input
                id="faviconUrl"
                name="faviconUrl"
                defaultValue={settings?.faviconUrl || ""}
                placeholder="https://.../favicon.ico"
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">
                Dipakai untuk ikon tab browser. Perubahan mungkin butuh hard refresh karena cache.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Pengaturan Langganan
          </CardTitle>
          <CardDescription>
            Konfigurasi harga dan parameter langganan Pro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subscriptionPrice">Harga Bulanan (Rp)</Label>
              <Input
                id="subscriptionPrice"
                name="subscriptionPrice"
                type="number"
                defaultValue={settings?.subscriptionPrice || 50000}
                min={0}
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">
                Harga Pro Plan per bulan
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quarterlyPrice">Harga 3 Bulan (Rp)</Label>
              <Input
                id="quarterlyPrice"
                name="quarterlyPrice"
                type="number"
                defaultValue={settings?.quarterlyPrice || 135000}
                min={0}
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">
                Harga Pro Plan untuk 3 bulan ({((settings?.quarterlyPrice || 135000) / 3).toLocaleString("id-ID")}/bulan)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="semiAnnualPrice">Harga 6 Bulan (Rp)</Label>
              <Input
                id="semiAnnualPrice"
                name="semiAnnualPrice"
                type="number"
                defaultValue={settings?.semiAnnualPrice || 250000}
                min={0}
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">
                Harga Pro Plan untuk 6 bulan ({((settings?.semiAnnualPrice || 250000) / 6).toLocaleString("id-ID")}/bulan)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="annualPrice">Harga 12 Bulan (Rp)</Label>
              <Input
                id="annualPrice"
                name="annualPrice"
                type="number"
                defaultValue={settings?.annualPrice || 450000}
                min={0}
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">
                Harga Pro Plan untuk 12 bulan ({((settings?.annualPrice || 450000) / 12).toLocaleString("id-ID")}/bulan)
              </p>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="defaultTeraValidity">Default Masa Berlaku Tera (hari)</Label>
              <Input
                id="defaultTeraValidity"
                name="defaultTeraValidity"
                type="number"
                defaultValue={settings?.defaultTeraValidity || 365}
                min={1}
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">
                Masa berlaku default sertifikat tera untuk organisasi baru
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Pengaturan Merchant
          </CardTitle>
          <CardDescription>
            Nama merchant dan instruksi pembayaran
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="merchantName">Nama Merchant</Label>
            <Input
              id="merchantName"
              name="merchantName"
              defaultValue={settings?.merchantName || "TERAMAP"}
              placeholder="TERAMAP"
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentInstructions">Instruksi Pembayaran</Label>
            <Textarea
              id="paymentInstructions"
              name="paymentInstructions"
              rows={4}
              defaultValue={settings?.paymentInstructions || ""}
              placeholder="Instruksi tambahan yang ditampilkan di halaman checkout..."
              disabled={isPending}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Metode Pembayaran Aktif
          </CardTitle>
          <CardDescription>
            Pilih metode pembayaran yang tersedia untuk pelanggan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input type="hidden" name="enabledPaymentChannels" value={JSON.stringify(enabledChannels)} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ALL_PAYMENT_CHANNELS.map((ch) => (
              <label
                key={ch.code}
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  enabledChannels.includes(ch.code) ? "bg-primary/5 border-primary/30" : "hover:bg-muted/50"
                }`}
              >
                <Checkbox
                  checked={enabledChannels.includes(ch.code)}
                  onCheckedChange={() => toggleChannel(ch.code)}
                />
                <div>
                  <p className="text-sm font-medium">{ch.name}</p>
                  <p className="text-xs text-muted-foreground">{ch.code}</p>
                </div>
              </label>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {enabledChannels.length} dari {ALL_PAYMENT_CHANNELS.length} metode aktif
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Sistem</CardTitle>
          <CardDescription>Status dan informasi platform TERAMAP</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Platform</span>
              <p className="font-medium">TERAMAP v1.0</p>
            </div>
            <div>
              <span className="text-muted-foreground">Framework</span>
              <p className="font-medium">Next.js 14 + TypeScript</p>
            </div>
            <div>
              <span className="text-muted-foreground">Database</span>
              <p className="font-medium">PostgreSQL + Prisma</p>
            </div>
            <div>
              <span className="text-muted-foreground">Payment Gateway</span>
              <p className="font-medium">Duitku</p>
            </div>
          </div>
          <Separator />
          {settings && (
            <p className="text-xs text-muted-foreground">
              Terakhir diperbarui: {new Date(settings.updatedAt).toLocaleString("id-ID")}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending} className="bg-red-600 hover:bg-red-700">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Simpan Pengaturan
            </>
          )}
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            Tersimpan!
          </span>
        )}
      </div>
    </form>
  );
}
