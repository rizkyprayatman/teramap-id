import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const merchantOrderId = req.nextUrl.searchParams.get("orderId") || "";
  if (!merchantOrderId.trim()) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  const tx = await prisma.transaction.findFirst({
    where: {
      organizationId: session.user.organizationId,
      merchantOrderId: merchantOrderId.trim(),
    },
    select: {
      merchantOrderId: true,
      amount: true,
      status: true,
      paymentChannel: true,
      vaNumber: true,
      paymentUrl: true,
      qrString: true,
      appUrl: true,
      createdAt: true,
    },
  });

  if (!tx) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  return NextResponse.json(tx, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
