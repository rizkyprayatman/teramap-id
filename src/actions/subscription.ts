"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createInvoice } from "@/lib/duitku";
import { parseEnabledPaymentChannels } from "@/lib/payment-channels";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";

export async function getSubscription() {
  const session = await auth();
  if (!session?.user?.organizationId) return null;

  return prisma.subscription.findUnique({
    where: { organizationId: session.user.organizationId },
  });
}

const BILLING_PERIOD_MAP: Record<string, { months: number; label: string; priceKey: keyof Pick<import("@prisma/client").SystemSetting, "subscriptionPrice" | "quarterlyPrice" | "semiAnnualPrice" | "annualPrice"> }> = {
  MONTHLY:     { months: 1,  label: "1 Bulan",  priceKey: "subscriptionPrice" },
  QUARTERLY:   { months: 3,  label: "3 Bulan",  priceKey: "quarterlyPrice" },
  SEMIANNUAL:  { months: 6,  label: "6 Bulan",  priceKey: "semiAnnualPrice" },
  ANNUAL:      { months: 12, label: "12 Bulan", priceKey: "annualPrice" },
};

export async function getSystemPricing() {
  const settings = await prisma.systemSetting.findFirst({
    orderBy: { updatedAt: "desc" },
  });
  return {
    monthly: settings?.subscriptionPrice || 50000,
    quarterly: settings?.quarterlyPrice || 135000,
    semiAnnual: settings?.semiAnnualPrice || 250000,
    annual: settings?.annualPrice || 450000,
  };
}

export async function createSubscriptionPayment(params: {
  billingPeriod: string;
  paymentChannel: string;
}) {
  const session = await auth();
  if (!session?.user?.organizationId) return { error: "Tidak terautentikasi" };
  if (session.user.role !== "ORGANIZATION_OWNER") return { error: "Tidak memiliki akses" };

  const periodInfo = BILLING_PERIOD_MAP[params.billingPeriod];
  if (!periodInfo) return { error: "Periode billing tidak valid" };
  if (!params.paymentChannel) return { error: "Metode pembayaran harus dipilih" };

  // Get system setting for price based on billing period
  const settings = await prisma.systemSetting.findFirst({
    orderBy: { updatedAt: "desc" },
  });
  const price = settings?.[periodInfo.priceKey] || 50000;

  const enabledCodes = parseEnabledPaymentChannels(settings?.enabledPaymentChannels);
  if (enabledCodes !== null && !enabledCodes.includes(params.paymentChannel)) {
    return { error: "Metode pembayaran tidak tersedia" };
  }

  const merchantOrderId = `TERA-${uuidv4().substring(0, 8).toUpperCase()}`;

  const org = await prisma.organization.findUnique({
    where: { id: session.user.organizationId },
  });

  try {
    const invoice = await createInvoice({
      merchantOrderId,
      amount: price,
      productDetails: `TERAMAP Pro Plan - ${periodInfo.label}`,
      customerEmail: session.user.email || "",
      customerName: org?.name || session.user.name || "Customer",
      paymentChannel: params.paymentChannel,
    });

    if (!invoice.paymentUrl) {
      console.error("[Subscription] Duitku response missing paymentUrl:", JSON.stringify(invoice));
      return { error: "Gagal membuat pembayaran: response tidak valid dari payment gateway." };
    }

    // Save transaction
    await prisma.transaction.create({
      data: {
        organizationId: session.user.organizationId,
        amount: price,
        status: "PENDING",
        merchantOrderId,
        duitkuReference: invoice.reference || null,
        paymentUrl: invoice.paymentUrl,
        paymentChannel: params.paymentChannel,
        billingPeriod: params.billingPeriod,
        billingMonths: periodInfo.months,
        description: `Upgrade ke Pro Plan - ${periodInfo.label}`,
      },
    });

    return {
      success: true,
      paymentUrl: invoice.paymentUrl,
      merchantOrderId,
      amount: price,
      vaNumber: invoice.vaNumber || null,
      reference: invoice.reference || null,
    };
  } catch (error: any) {
    console.error("[Subscription] Payment creation failed:", error?.message || error);
    return { error: "Gagal membuat pembayaran. Coba lagi nanti." };
  }
}

export async function getTransactionHistory() {
  const session = await auth();
  if (!session?.user?.organizationId) return [];

  return prisma.transaction.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

// ===== SUPER ADMIN =====

export async function updateSystemSettings(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") return { error: "Akses ditolak" };

  const logoUrlRaw = (formData.get("logoUrl") as string) || "";
  const faviconUrlRaw = (formData.get("faviconUrl") as string) || "";
  const logoUrl = logoUrlRaw.trim() ? logoUrlRaw.trim() : null;
  const faviconUrl = faviconUrlRaw.trim() ? faviconUrlRaw.trim() : null;

  const subscriptionPrice = parseInt(formData.get("subscriptionPrice") as string) || 50000;
  const quarterlyPrice = parseInt(formData.get("quarterlyPrice") as string) || 135000;
  const semiAnnualPrice = parseInt(formData.get("semiAnnualPrice") as string) || 250000;
  const annualPrice = parseInt(formData.get("annualPrice") as string) || 450000;
  const defaultTeraValidity = parseInt(formData.get("defaultTeraValidity") as string) || 365;
  const merchantName = (formData.get("merchantName") as string) || null;
  const paymentInstructions = (formData.get("paymentInstructions") as string) || null;
  const enabledPaymentChannelsRaw = (formData.get("enabledPaymentChannels") as string) || null;
  const enabledPaymentChannelsParsed = parseEnabledPaymentChannels(enabledPaymentChannelsRaw);
  const enabledPaymentChannels = enabledPaymentChannelsParsed
    ? JSON.stringify(enabledPaymentChannelsParsed)
    : null;

  const existing = await prisma.systemSetting.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  const data = {
    logoUrl,
    faviconUrl,
    subscriptionPrice,
    quarterlyPrice,
    semiAnnualPrice,
    annualPrice,
    defaultTeraValidity,
    merchantName,
    paymentInstructions,
    enabledPaymentChannels,
  };

  if (existing) {
    await prisma.systemSetting.update({
      where: { id: existing.id },
      data,
    });
  } else {
    await prisma.systemSetting.create({ data });
  }

  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { success: true };
}

export async function getAllTransactions() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") return [];

  return prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    include: { organization: true },
    take: 100,
  });
}
