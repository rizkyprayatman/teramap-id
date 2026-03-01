"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, KeyRound, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { resetPasswordAction } from "@/actions/auth";
import { toast } from "sonner";
import { BrandBadge } from "@/components/branding/brand-badge";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const tokenInit = useRef(false);

  useEffect(() => {
    if (tokenInit.current) return;
    tokenInit.current = true;

    if (!token) {
      setStatus("error");
      setMessage("Token reset password tidak ditemukan.");
    }
  }, [token]);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);

    try {
      const result = await resetPasswordAction(formData);
      if (result?.error) {
        setStatus("error");
        setMessage(result.error);
        toast.error(result.error);
      } else {
        const msg = result?.message || "Password berhasil direset.";
        setStatus("success");
        setMessage(msg);
        toast.success(msg);
      }
    } finally {
      setLoading(false);
    }
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
          <CardTitle className="text-xl">Reset Password</CardTitle>
          <CardDescription>
            Buat password baru untuk akun Anda
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
            <input type="hidden" name="token" value={token} />

            {message && (
              <div
                className={`p-3 text-sm rounded-md border ${
                  status === "success"
                    ? "text-green-700 bg-green-50 border-green-200"
                    : status === "error"
                      ? "text-red-700 bg-red-50 border-red-200"
                      : "text-muted-foreground bg-muted/30 border-border"
                }`}
              >
                <div className="flex items-start gap-2">
                  {status === "success" ? (
                    <CheckCircle className="h-4 w-4 mt-0.5" />
                  ) : status === "error" ? (
                    <XCircle className="h-4 w-4 mt-0.5" />
                  ) : null}
                  <span>{message}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password Baru</Label>
              <PasswordInput
                id="password"
                name="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!token || status === "success" || loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                placeholder="••••••••"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={!token || status === "success" || loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !token || !password || !confirmPassword || status === "success"}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
              Simpan Password Baru
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Login
              </Button>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
