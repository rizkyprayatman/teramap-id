"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { requestPasswordResetAction } from "@/actions/auth";
import { toast } from "sonner";
import { BrandBadge } from "@/components/branding/brand-badge";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);

    try {
      const result = await requestPasswordResetAction(formData);
      const msg = result?.message || "Jika email terdaftar, link reset password akan dikirim.";
      setMessage(msg);
      toast.success(msg);
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
          <CardTitle className="text-xl">Lupa Password</CardTitle>
          <CardDescription>
            Masukkan email Anda untuk menerima link reset password
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
            {message && (
              <div className="p-3 text-sm text-green-700 bg-green-50 rounded-md border border-green-200">
                {message}
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
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading || !email}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              Kirim Link Reset
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
