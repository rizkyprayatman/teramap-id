"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Copy,
  ExternalLink,
  ArrowLeft,
  Clock,
  CreditCard,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED";

type TransactionDetail = {
  merchantOrderId: string | null;
  amount: number;
  status: PaymentStatus;
  paymentChannel: string | null;
  vaNumber: string | null;
  paymentUrl: string | null;
  qrString: string | null;
  appUrl: string | null;
};

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId = searchParams.get("orderId") || "";
  const amount = Number(searchParams.get("amount")) || 0;
  const channel = searchParams.get("channel") || "";
  const channelName = searchParams.get("channelName") || channel;
  const vaNumber = searchParams.get("vaNumber") || "";
  const paymentUrl = searchParams.get("paymentUrl") || "";
  const merchantNameParam = searchParams.get("merchantName") || "";

  const [status, setStatus] = useState<PaymentStatus>("PENDING");
  const [polling, setPolling] = useState(true);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [startTime] = useState(Date.now());
  const [checking, setChecking] = useState(false);
  const [merchantName, setMerchantName] = useState<string | null>(merchantNameParam || null);
  const [paymentInstructions, setPaymentInstructions] = useState<string | null>(null);
  const [txDetail, setTxDetail] = useState<TransactionDetail | null>(null);
  const [qrisDataUrl, setQrisDataUrl] = useState<string | null>(null);

  // Calculate elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setCountdown(elapsed);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // Load merchant name + optional instructions from system settings
  useEffect(() => {
    let cancelled = false;

    // If passed explicitly, prefer query param.
    if (merchantNameParam.trim()) {
      setMerchantName(merchantNameParam.trim());
    }

    (async () => {
      try {
        const res = await fetch("/api/branding");
        if (!res.ok) return;
        const data = (await res.json()) as {
          merchantName?: string | null;
          paymentInstructions?: string | null;
        };
        if (cancelled) return;

        if (!merchantNameParam.trim()) {
          setMerchantName(data.merchantName ?? null);
        }
        setPaymentInstructions(data.paymentInstructions ?? null);
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [merchantNameParam]);

  // Load transaction detail (including qrString) from DB
  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/transaction-detail?orderId=${encodeURIComponent(orderId)}`);
        if (!res.ok) return;
        const data = (await res.json()) as TransactionDetail;
        if (cancelled) return;

        setTxDetail(data);
        if (data?.status) setStatus(data.status);
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  // Poll transaction status
  const checkStatus = useCallback(async () => {
    if (!orderId) return;
    try {
      const res = await fetch(`/api/transaction-status?orderId=${orderId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === "SUCCESS" || data.status === "FAILED" || data.status === "EXPIRED") {
          setStatus(data.status);
          setPolling(false);
        }
      }
    } catch {
      // Silently retry
    }
  }, [orderId]);

  useEffect(() => {
    if (!polling) return;
    // Check immediately
    checkStatus();
    // Then poll every 10 seconds
    const interval = setInterval(checkStatus, 10000);
    // Stop polling after 30 minutes
    const timeout = setTimeout(() => {
      setPolling(false);
    }, 30 * 60 * 1000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [polling, checkStatus]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Determine if this is a VA-based payment
  const isVA = ["BK", "M1", "BT", "BN", "BI", "BC"].some(
    (code) => channel.startsWith(code) || channel === code
  );
  const isQRIS = channel === "SP" || channel === "SQ" || channel === "GQ" || channel === "NQ";

  const effectivePaymentUrl = txDetail?.paymentUrl || paymentUrl;
  const effectiveVaNumber = txDetail?.vaNumber || vaNumber;
  const effectiveAmount = Number(txDetail?.amount ?? amount) || 0;
  const effectiveQrisString = txDetail?.qrString || null;

  // Generate QR code image for QRIS (if available)
  useEffect(() => {
    if (!isQRIS || !effectiveQrisString?.trim()) {
      setQrisDataUrl(null);
      return;
    }

    let cancelled = false;
    QRCode.toDataURL(effectiveQrisString, { margin: 1, width: 256 })
      .then((url) => {
        if (!cancelled) setQrisDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrisDataUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [isQRIS, effectiveQrisString]);

  if (!orderId) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Data Pembayaran Tidak Valid</h2>
        <p className="text-muted-foreground mb-4">Parameter transaksi tidak ditemukan.</p>
        <Button onClick={() => router.push("/dashboard/subscription")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Langganan
        </Button>
      </div>
    );
  }

  // Success state
  if (status === "SUCCESS") {
    return (
      <div className="max-w-lg mx-auto py-12">
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-8 text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-green-700">Pembayaran Berhasil!</h2>
            <p className="text-green-600">
              Langganan Pro Plan Anda telah aktif.
            </p>
            <div className="p-3 bg-white rounded-lg border border-green-200 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jumlah</span>
                <span className="font-semibold">{formatCurrency(amount)}</span>
              </div>
            </div>
            <Button onClick={() => router.push("/dashboard/subscription")} className="w-full">
              Lihat Detail Langganan
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Failed state
  if (status === "FAILED" || status === "EXPIRED") {
    return (
      <div className="max-w-lg mx-auto py-12">
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="pt-8 text-center space-y-4">
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            <h2 className="text-2xl font-bold text-red-700">
              Pembayaran {status === "EXPIRED" ? "Kadaluarsa" : "Gagal"}
            </h2>
            <p className="text-red-600">
              {status === "EXPIRED"
                ? "Batas waktu pembayaran telah habis."
                : "Pembayaran tidak dapat diproses."}
            </p>
            <div className="p-3 bg-white rounded-lg border border-red-200 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono">{orderId}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/subscription")}
                className="flex-1"
              >
                Kembali
              </Button>
              <Button
                onClick={() => router.push("/dashboard/subscription")}
                className="flex-1"
              >
                Coba Lagi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pending state - show payment instructions
  return (
    <div className="max-w-lg mx-auto py-8 space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.push("/dashboard/subscription")}
        className="mb-2"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali ke Langganan
      </Button>

      {/* Payment Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Detail Pembayaran
            </CardTitle>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Menunggu Pembayaran
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-mono text-xs">{orderId}</span>
            </div>
            {merchantName ? (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Merchant</span>
                <span className="font-medium">{merchantName}</span>
              </div>
            ) : null}
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Metode Pembayaran</span>
              <span className="font-medium">{channelName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Pembayaran</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(effectiveAmount)}
              </span>
            </div>
          </div>

          {/* VA Number */}
          {effectiveVaNumber && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                {isVA ? "Nomor Virtual Account" : "Kode Pembayaran"}
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-2xl font-bold font-mono tracking-wider">
                  {effectiveVaNumber}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(effectiveVaNumber)}
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Jumlah to copy */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Jumlah yang harus ditransfer
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-2xl font-bold">{formatCurrency(effectiveAmount)}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(String(effectiveAmount))}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Pastikan nominal transfer sesuai hingga digit terakhir
            </p>
          </div>

          {/* QRIS / External link */}
          {(isQRIS || effectivePaymentUrl) && (
            <div className="space-y-2">
              {isQRIS ? (
                qrisDataUrl ? (
                  <div className="p-4 bg-muted/30 rounded-lg flex flex-col items-center gap-3">
                    <p className="text-sm text-muted-foreground text-center">
                      Scan QRIS di bawah untuk menyelesaikan transaksi <br /> Pastikan tujuan pembayaran
                      nya sesuai: <br /> <span className="font-semibold text-xl text-blue-700">{merchantName}</span>
                    </p>
                    <Image
                      src={qrisDataUrl}
                      alt="QRIS"
                      width={256}
                      height={256}
                      unoptimized
                      className="h-64 w-64 rounded-md border bg-white"
                    />
                    {effectivePaymentUrl ? (
                      <a
                        href={effectivePaymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full"
                      >
                        <Button variant="outline" className="w-full">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Buka Halaman Pembayaran (Opsional)
                        </Button>
                      </a>
                    ) : null}
                  </div>
                ) : effectivePaymentUrl ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground text-center">
                      QR belum tersedia, gunakan tombol di bawah
                    </p>
                    <a
                      href={effectivePaymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button variant="outline" className="w-full">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Buka QR Code
                      </Button>
                    </a>
                  </div>
                ) : null
              ) : effectivePaymentUrl ? (
                <a
                  href={effectivePaymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Buka Halaman Pembayaran
                  </Button>
                </a>
              ) : null}
            </div>
          )}

          {/* Payment instructions */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
            <div className="font-medium text-blue-700 text-sm">Cara Pembayaran:</div>
            {merchantName ? (
              <p className="text-sm text-blue-700">
                Pastikan tujuan pembayaran atas nama <br /> <span className="font-semibold">{merchantName}</span>.
              </p>
            ) : null}
            {paymentInstructions?.trim() ? (
              <p className="text-sm text-blue-600 whitespace-pre-line">{paymentInstructions.trim()}</p>
            ) : null}
            <ol className="text-sm text-blue-600 space-y-1 list-decimal list-inside">
              {isVA ? (
                <>
                  <li>Buka aplikasi mobile banking atau ATM</li>
                  <li>Pilih menu Transfer / Pembayaran</li>
                  <li>Masukkan nomor Virtual Account di atas</li>
                  <li>Masukkan jumlah sesuai nominal</li>
                  <li>Konfirmasi dan selesaikan pembayaran</li>
                </>
              ) : isQRIS ? (
                <>
                  <li>Buka aplikasi e-wallet (GoPay, OVO, DANA, dll)</li>
                  <li>Pilih menu Scan / Bayar</li>
                  <li>Scan QR Code pada halaman pembayaran</li>
                  <li>Konfirmasi dan selesaikan pembayaran</li>
                </>
              ) : (
                <>
                  <li>Buka halaman pembayaran melalui tombol di atas</li>
                  <li>Ikuti instruksi pada halaman tersebut</li>
                  <li>Selesaikan pembayaran sebelum batas waktu</li>
                </>
              )}
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Polling status indicator */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
            {polling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
            <span>
              {polling
                ? `Menunggu konfirmasi pembayaran... (${formatTime(countdown)})`
                : "Polling otomatis berhenti setelah 30 menit"}
            </span>
          </div>
          <div className="flex justify-center mt-3">
            <Button
              variant="outline"
              size="sm"
              disabled={checking}
              onClick={async () => {
                setChecking(true);
                await checkStatus();
                if (!polling) setPolling(true);
                setChecking(false);
              }}
            >
              {checking ? (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-3 w-3" />
              )}
              Cek Status Sekarang
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-2">
            Halaman ini akan otomatis diperbarui saat pembayaran diterima.
            <br />
            Batas waktu pembayaran: 24 jam.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-lg mx-auto py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Memuat halaman pembayaran...</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
