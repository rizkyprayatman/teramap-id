"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle, XCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyEmailAction, resendVerificationEmail } from "@/actions/auth";
import { BrandBadge } from "@/components/branding/brand-badge";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const hasVerified = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token verifikasi tidak ditemukan.");
      return;
    }

    // Prevent double-fire in React StrictMode
    if (hasVerified.current) return;
    hasVerified.current = true;

    verifyEmailAction(token).then((result) => {
      if (result.success) {
        setStatus("success");
        setMessage(result.message || "Email berhasil diverifikasi!");
      } else {
        setStatus("error");
        setMessage(result.error || "Verifikasi gagal.");
      }
    });
  }, [token]);

  const handleResend = async () => {
    if (!resendEmail) return;
    setResending(true);
    const result = await resendVerificationEmail(resendEmail);
    setResendMsg(result.message || result.error || "");
    setResending(false);
  };

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

          {status === "loading" && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <CardTitle>Memverifikasi Email...</CardTitle>
              <CardDescription>Mohon tunggu sebentar</CardDescription>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-green-700">Email Terverifikasi!</CardTitle>
              <CardDescription className="text-base">{message}</CardDescription>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-red-700">Verifikasi Gagal</CardTitle>
              <CardDescription className="text-base">{message}</CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent>
          {status === "error" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Masukkan email Anda untuk mengirim ulang link verifikasi:
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <Button onClick={handleResend} disabled={resending} size="sm">
                  {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                </Button>
              </div>
              {resendMsg && (
                <p className="text-xs text-center text-green-600">{resendMsg}</p>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          {status === "success" && (
            <Link href="/login" className="w-full">
              <Button className="w-full">
                Masuk ke Akun
              </Button>
            </Link>
          )}
          <Link href="/" className="w-full">
            <Button variant="ghost" className="w-full">
              Kembali ke Beranda
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
