"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { registerAction } from "@/actions/auth";
import { ORGANIZATION_TYPE_LABELS } from "@/lib/constants";
import { toast } from "sonner";
import { BrandBadge } from "@/components/branding/brand-badge";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await registerAction(formData);
      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
      } else if (result?.success) {
        const msg = result.message || "Registrasi berhasil!";
        setSuccess(msg);
        toast.success(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-xl">Cek Email Anda!</CardTitle>
            <CardDescription className="text-base">
              {success}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Langkah selanjutnya:</p>
                  <ol className="list-decimal list-inside space-y-1 text-blue-700">
                    <li>Buka inbox email Anda</li>
                    <li>Klik link verifikasi di email</li>
                    <li>Login ke dashboard TERAMAP</li>
                  </ol>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full">
                Kembali ke Halaman Login
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center space-x-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <BrandBadge iconClassName="h-6 w-6 text-white" imgClassName="h-7 w-7" />
            </div>
            <span className="text-2xl font-bold">TERAMAP</span>
          </Link>
          <CardTitle className="text-xl">Buat Akun Baru</CardTitle>
          <CardDescription>
            Daftarkan organisasi Anda untuk memulai
          </CardDescription>
        </CardHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleSubmit(formData);
          }}
        >
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" name="name" placeholder="John Doe" required disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="nama@email.com" required disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organizationName">Nama Organisasi</Label>
              <Input id="organizationName" name="organizationName" placeholder="Dinas Perdagangan Kota..." required disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organizationType">Tipe Organisasi</Label>
              <Select name="organizationType" defaultValue="GOVERNMENT" disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe organisasi" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ORGANIZATION_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput id="password" name="password" placeholder="Min. 6 karakter" required disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <PasswordInput id="confirmPassword" name="confirmPassword" placeholder="Ulangi password" required disabled={loading} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Daftar Sekarang
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Masuk di sini
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
