"use client";

import { useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle, KeyRound } from "lucide-react";
import { setupPasswordAction } from "@/actions/auth";

function SetupPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string; message?: string } | null>(null);

  const handleSubmit = (formData: FormData) => {
    if (!token) return;
    formData.set("token", token);
    startTransition(async () => {
      const res = await setupPasswordAction(formData);
      setResult(res);
    });
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Link Tidak Valid</h2>
            <p className="text-muted-foreground mb-4">
              Link setup password tidak valid. Pastikan Anda menggunakan link dari email undangan.
            </p>
            <Link href="/login">
              <Button>Ke Halaman Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (result?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Password Berhasil Diatur!</h2>
            <p className="text-muted-foreground mb-4">
              {result.message}
            </p>
            <Link href="/login">
              <Button className="w-full">Login Sekarang</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
            <KeyRound className="h-7 w-7 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Atur Password</CardTitle>
          <CardDescription>
            Buat password untuk mengaktifkan akun TERAMAP Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            {result?.error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {result.error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                name="password"
                required
                placeholder="Min. 6 karakter"
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                required
                placeholder="Ulangi password"
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Atur Password & Aktifkan Akun
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SetupPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <SetupPasswordForm />
    </Suspense>
  );
}
