import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPaymentChannels } from "@/lib/duitku";
import { prisma } from "@/lib/prisma";
import { parseEnabledPaymentChannels } from "@/lib/payment-channels";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const amount = parseInt(req.nextUrl.searchParams.get("amount") || "50000");
    
    // Get system settings for pricing and enabled channels
    const settings = await prisma.systemSetting.findFirst({
      orderBy: { updatedAt: "desc" },
    });
    const finalAmount = amount || settings?.subscriptionPrice || 50000;

    const enabledCodes = parseEnabledPaymentChannels(settings?.enabledPaymentChannels);

    const allChannels = await getPaymentChannels(finalAmount);

    // Filter by enabled channels if configured
    const channels = enabledCodes !== null
      ? allChannels.filter((ch) => enabledCodes.includes(ch.paymentMethod))
      : allChannels;

    return NextResponse.json(
      { channels },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Payment Methods] Error:", message);
    return NextResponse.json({ error: "Gagal mengambil metode pembayaran" }, { status: 500 });
  }
}
