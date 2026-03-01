"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { loginAction, resendVerificationEmail } from "@/actions/auth";
import { toast } from "sonner";
import { BrandBadge } from "@/components/branding/brand-badge";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setShowResend(false);
    setResendMsg(null);

    try {
      const emailVal = (formData.get("email") as string) || "";
      setResendEmail(emailVal);

      const result = await loginAction(formData);
      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
        if (result.error.includes("belum diverifikasi")) {
          setShowResend(true);
        }
      }
    } catch {
      // loginAction can redirect on success; Next will handle navigation.
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setResendMsg(null);
    const result = await resendVerificationEmail(resendEmail);
    const msg = result.message || result.error || "";
    setResendMsg(msg);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(msg);
    }
    setResending(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center space-x-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <BrandBadge iconClassName="h-6 w-6 text-white" imgClassName="h-7 w-7" />
            </div>
            <span className="text-2xl font-bold">TERAMAP</span>
          </Link>
          <CardTitle className="text-xl">Masuk ke Akun</CardTitle>
          <CardDescription>
            Masukkan email dan password untuk melanjutkan
          </CardDescription>
        </CardHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleSubmit(formData);
          }}
          onChange={e => {
            const form = e.currentTarget as HTMLFormElement;
            const formData = new FormData(form);
            setEmail(formData.get("email") as string);
            setPassword(formData.get("password") as string);
          }}
        >
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                {error}
                {showResend && (
                  <div className="mt-2 pt-2 border-t border-red-200">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResend}
                      disabled={resending}
                      className="w-full text-xs"
                    >
                      {resending ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <Mail className="mr-1 h-3 w-3" />
                      )}
                      Kirim Ulang Email Verifikasi
                    </Button>
                  </div>
                )}
              </div>
            )}
            {resendMsg && (
              <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md border border-green-200">
                {resendMsg}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@email.com"
                required
                autoComplete="email"
                disabled={loading || resending}
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                name="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                disabled={loading || resending}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Lupa password?
                </Link>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !email || !password}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Masuk
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Belum punya akun?{" "}
              <Link href="/register" className="text-primary font-medium hover:underline">
                Daftar di sini
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
