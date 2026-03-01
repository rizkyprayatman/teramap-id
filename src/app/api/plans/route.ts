import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ plans });
  } catch (error) {
    console.error("[Plans API] Error:", error);
    return NextResponse.json({ plans: [] });
  }
}
