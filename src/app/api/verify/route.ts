import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const equipmentSelect = {
  id: true,
  name: true,
  type: true,
  brand: true,
  model: true,
  serialNumber: true,
  capacity: true,
  divisionValue: true,
  status: true,
  barcode: true,
  lastTeraDate: true,
  teraExpiryDate: true,
  ownerName: true,
  businessName: true,
  organization: {
    select: {
      name: true,
      type: true,
    },
  },
  teraHistories: {
    orderBy: { testDate: "desc" as const },
    take: 3,
    select: {
      testDate: true,
      result: true,
      officerName: true,
    },
  },
};

export async function GET(req: NextRequest) {
  const barcode = req.nextUrl.searchParams.get("barcode");
  const query = req.nextUrl.searchParams.get("query");
  const searchType = req.nextUrl.searchParams.get("type") || "barcode";

  // Search by barcode (exact match)
  if (barcode) {
    const equipment = await prisma.equipment.findFirst({
      where: { barcode },
      select: equipmentSelect,
    });

    if (!equipment) {
      return NextResponse.json({ found: false });
    }
    return NextResponse.json({ found: true, equipment });
  }

  // Search by query (owner name or business name)
  if (query && query.trim().length >= 2) {
    const searchTerm = query.trim();

    const where = searchType === "owner"
      ? { ownerName: { contains: searchTerm, mode: "insensitive" as const } }
      : searchType === "business"
      ? { businessName: { contains: searchTerm, mode: "insensitive" as const } }
      : {
          OR: [
            { barcode: { contains: searchTerm, mode: "insensitive" as const } },
            { ownerName: { contains: searchTerm, mode: "insensitive" as const } },
            { businessName: { contains: searchTerm, mode: "insensitive" as const } },
          ],
        };

    const equipmentList = await prisma.equipment.findMany({
      where,
      select: equipmentSelect,
      take: 20,
      orderBy: { updatedAt: "desc" },
    });

    if (equipmentList.length === 0) {
      return NextResponse.json({ found: false });
    }

    if (equipmentList.length === 1) {
      return NextResponse.json({ found: true, equipment: equipmentList[0] });
    }

    return NextResponse.json({ found: true, multiple: true, equipmentList });
  }

  return NextResponse.json({ error: "Parameter pencarian tidak valid" }, { status: 400 });
}
