import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPaymentChannels } from "@/lib/duitku";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const amount = parseInt(req.nextUrl.searchParams.get("amount") || "50000");
    
    // Get system settings for pricing and enabled channels
    const settings = await prisma.systemSetting.findFirst();
    const finalAmount = amount || settings?.subscriptionPrice || 50000;

    let enabledCodes: string[] | null = null;
    if (settings?.enabledPaymentChannels) {
      try {
        enabledCodes = JSON.parse(settings.enabledPaymentChannels);
      } catch { /* ignore */ }
    }

    const allChannels = await getPaymentChannels(finalAmount);

    // Filter by enabled channels if configured
    const channels = enabledCodes
      ? allChannels.filter((ch: any) => enabledCodes!.includes(ch.paymentMethod))
      : allChannels;

    return NextResponse.json({ channels });
  } catch (error: any) {
    console.error("[Payment Methods] Error:", error?.message || error);
    return NextResponse.json({ error: "Gagal mengambil metode pembayaran" }, { status: 500 });
  }
}
