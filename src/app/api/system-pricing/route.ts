import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await prisma.systemSetting.findFirst({
    orderBy: { updatedAt: "desc" },
    select: {
      subscriptionPrice: true,
      quarterlyPrice: true,
      semiAnnualPrice: true,
      annualPrice: true,
    },
  });

  return NextResponse.json(
    {
      monthly: settings?.subscriptionPrice ?? 50000,
      quarterly: settings?.quarterlyPrice ?? 135000,
      semiAnnual: settings?.semiAnnualPrice ?? 250000,
      annual: settings?.annualPrice ?? 450000,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
