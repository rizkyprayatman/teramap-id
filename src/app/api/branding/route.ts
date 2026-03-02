import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await prisma.systemSetting.findFirst({
    orderBy: { updatedAt: "desc" },
    select: {
      logoUrl: true,
      faviconUrl: true,
      merchantName: true,
      paymentInstructions: true,
    },
  });

  return NextResponse.json({
    logoUrl: settings?.logoUrl ?? null,
    faviconUrl: settings?.faviconUrl ?? null,
    merchantName: settings?.merchantName ?? null,
    paymentInstructions: settings?.paymentInstructions ?? null,
  });
}
