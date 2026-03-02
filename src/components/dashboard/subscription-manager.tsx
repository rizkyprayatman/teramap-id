"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CreditCard,
  CheckCircle2,
  Zap,
  Crown,
  Loader2,
  ExternalLink,
  Shield,
  ArrowLeft,
} from "lucide-react";
import { createSubscriptionPayment } from "@/actions/subscription";
import { formatCurrency, formatDate } from "@/lib/utils";
import Image from "next/image";

interface Subscription {
  id: string;
  planType: string;
  status: string;
  maxEquipment: number | null;
  startDate: string | null;
  endDate: string | null;
}

interface Transaction {
  id: string;
  amount: number;
  status: string;
  merchantOrderId: string;
  description: string | null;
  paymentUrl: string | null;
  createdAt: string;
}

interface Pricing {
  monthly: number;
  quarterly: number;
  semiAnnual: number;
  annual: number;
}

interface PaymentChannel {
  paymentMethod: string;
  paymentName: string;
  paymentImage: string;
  totalFee: number;
}

interface Props {
  subscription: Subscription | null;
  transactions: Transaction[];
  isOwner: boolean;
  pricing: Pricing;
}

const BILLING_PERIODS = [
  { key: "MONTHLY", label: "1 Bulan", months: 1, priceKey: "monthly" as const },
  { key: "QUARTERLY", label: "3 Bulan", months: 3, priceKey: "quarterly" as const },
  { key: "SEMIANNUAL", label: "6 Bulan", months: 6, priceKey: "semiAnnual" as const },
  { key: "ANNUAL", label: "12 Bulan", months: 12, priceKey: "annual" as const },
];

export function SubscriptionManager({ subscription, transactions, isOwner, pricing }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [step, setStep] = useState<"plan" | "payment">("plan");
  const [billingPeriod, setBillingPeriod] = useState("MONTHLY");
  const [paymentChannel, setPaymentChannel] = useState("");
  const [paymentChannels, setPaymentChannels] = useState<PaymentChannel[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(false);

  const isPro = subscription?.planType === "PRO";
  const isActive = subscription?.status === "ACTIVE";

  const selectedPeriod = BILLING_PERIODS.find((p) => p.key === billingPeriod)!;
  const selectedPrice = pricing[selectedPeriod.priceKey];
  const monthlyEquivalent = Math.round(selectedPrice / selectedPeriod.months);
  const fullMonthlyPrice = pricing.monthly;
  const savingsPercent =
    selectedPeriod.months > 1
      ? Math.round((1 - monthlyEquivalent / fullMonthlyPrice) * 100)
      : 0;

  // Fetch payment channels when billing period changes and we're on payment step
  useEffect(() => {
    if (step !== "payment") return;
    setLoadingChannels(true);
    setPaymentChannel("");
    fetch(`/api/payment-methods?amount=${selectedPrice}&t=${Date.now()}`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((data) => {
        setPaymentChannels(data.channels || []);
      })
      .catch(() => setPaymentChannels([]))
      .finally(() => setLoadingChannels(false));
  }, [step, selectedPrice]);

  const handleProceedToPayment = () => {
    setStep("payment");
  };

  const handleUpgrade = () => {
    if (!paymentChannel) {
      setError("Pilih metode pembayaran terlebih dahulu");
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await createSubscriptionPayment({
        billingPeriod,
        paymentChannel,
      });
      if (result.error) {
        setError(result.error);
      } else if (result.merchantOrderId) {
        // Navigate to internal checkout page
        const selectedCh = paymentChannels.find((c) => c.paymentMethod === paymentChannel);
        const params = new URLSearchParams({
          orderId: result.merchantOrderId,
          amount: String(result.amount || selectedPrice),
          channel: paymentChannel,
          channelName: selectedCh?.paymentName || paymentChannel,
          ...(result.vaNumber ? { vaNumber: result.vaNumber } : {}),
          ...(result.paymentUrl ? { paymentUrl: result.paymentUrl } : {}),
        });
        router.push(`/dashboard/subscription/checkout?${params.toString()}`);
      }
    });
  };

  const statusMap: Record<string, { label: string; variant: "default" | "destructive" | "secondary" | "outline" }> = {
    PENDING: { label: "Menunggu", variant: "secondary" },
    SUCCESS: { label: "Berhasil", variant: "default" },
    FAILED: { label: "Gagal", variant: "destructive" },
    EXPIRED: { label: "Kadaluarsa", variant: "outline" },
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Step: Plan Selection */}
      {step === "plan" && (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Free Plan */}
            <Card className={!isPro ? "border-primary ring-2 ring-primary/20" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Free Plan
                  </CardTitle>
                  {!isPro && <Badge>Aktif</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">Gratis</div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Maks. 10 alat
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Barcode & scanner
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Peta lokasi
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    1 template dokumen
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className={isPro ? "border-primary ring-2 ring-primary/20" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    Pro Plan
                  </CardTitle>
                  {isPro && <Badge>Aktif</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">
                  {formatCurrency(pricing.monthly)}
                  <span className="text-sm font-normal text-muted-foreground">/bulan</span>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Alat unlimited
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Template custom unlimited
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Generate surat & PDF
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Multi-user management
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Laporan & statistik
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Support prioritas
                  </li>
                </ul>

                {!isPro && isOwner && (
                  <Button onClick={handleProceedToPayment} className="w-full mt-4">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pilih Paket & Bayar
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Step: Payment - Billing Period + Payment Method */}
      {step === "payment" && (
        <>
          <Button variant="ghost" onClick={() => setStep("plan")} className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>

          {/* Billing Period Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Pilih Durasi Langganan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {BILLING_PERIODS.map((period) => {
                  const price = pricing[period.priceKey];
                  const perMonth = Math.round(price / period.months);
                  const savings =
                    period.months > 1
                      ? Math.round((1 - perMonth / fullMonthlyPrice) * 100)
                      : 0;
                  const isSelected = billingPeriod === period.key;
                  return (
                    <button
                      key={period.key}
                      onClick={() => setBillingPeriod(period.key)}
                      className={`relative p-4 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-muted hover:border-primary/50"
                      }`}
                    >
                      {savings > 0 && (
                        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                          Hemat {savings}%
                        </span>
                      )}
                      <div className="font-semibold text-sm">{period.label}</div>
                      <div className="text-lg font-bold mt-1">{formatCurrency(price)}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(perMonth)}/bulan
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 p-3 bg-muted/50 rounded-lg flex justify-between items-center">
                <div>
                  <div className="font-medium">
                    Pro Plan - {selectedPeriod.label}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(monthlyEquivalent)}/bulan
                    {savingsPercent > 0 && (
                      <span className="text-green-600 ml-2">
                        (hemat {savingsPercent}%)
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xl font-bold">{formatCurrency(selectedPrice)}</div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Pilih Metode Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingChannels ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Memuat metode pembayaran...</span>
                </div>
              ) : paymentChannels.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Tidak ada metode pembayaran tersedia. Coba lagi nanti.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {paymentChannels.map((ch) => {
                    const isSelected = paymentChannel === ch.paymentMethod;
                    return (
                      <button
                        key={ch.paymentMethod}
                        onClick={() => setPaymentChannel(ch.paymentMethod)}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-muted hover:border-primary/50"
                        }`}
                      >
                        {ch.paymentImage && (
                          <Image
                            src={ch.paymentImage}
                            alt={ch.paymentName}
                            width={60}
                            height={30}
                            className="object-contain"
                            unoptimized
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{ch.paymentName}</div>
                          {ch.totalFee > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Biaya: {formatCurrency(ch.totalFee)}
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <Button
                onClick={handleUpgrade}
                disabled={isPending || !paymentChannel}
                className="w-full mt-6"
                size="lg"
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="mr-2 h-4 w-4" />
                )}
                Bayar {formatCurrency(selectedPrice)}
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {/* Subscription Details */}
      {subscription && isPro && step === "plan" && (
        <Card>
          <CardHeader>
            <CardTitle>Detail Langganan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={isActive ? "default" : "destructive"}>
                {isActive ? "Aktif" : subscription.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Batas Alat</span>
              <span>{subscription.maxEquipment || "Unlimited"}</span>
            </div>
            {subscription.startDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mulai</span>
                <span>{formatDate(new Date(subscription.startDate))}</span>
              </div>
            )}
            {subscription.endDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Berakhir</span>
                <span>{formatDate(new Date(subscription.endDate))}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      {step === "plan" && (
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Transaksi</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      Belum ada transaksi
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => {
                    const s = statusMap[tx.status] || statusMap.PENDING;
                    return (
                      <TableRow key={tx.id}>
                        <TableCell className="font-mono text-xs">{tx.merchantOrderId}</TableCell>
                        <TableCell>{tx.description || "-"}</TableCell>
                        <TableCell>{formatCurrency(tx.amount)}</TableCell>
                        <TableCell>
                          <Badge variant={s.variant}>{s.label}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(new Date(tx.createdAt))}</TableCell>
                        <TableCell>
                          {tx.status === "PENDING" && tx.paymentUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const params = new URLSearchParams({
                                  orderId: tx.merchantOrderId,
                                  amount: String(tx.amount),
                                  ...(tx.paymentUrl ? { paymentUrl: tx.paymentUrl } : {}),
                                });
                                router.push(`/dashboard/subscription/checkout?${params.toString()}`);
                              }}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Bayar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
