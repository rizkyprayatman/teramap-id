"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getReportData(filters?: {
  status?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  expiryFrom?: string;
  expiryTo?: string;
  city?: string;
}) {
  const session = await auth();
  if (!session?.user?.organizationId) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    organizationId: session.user.organizationId,
  };

  if (filters?.status && filters.status !== "ALL") {
    where.status = filters.status;
  }

  if (filters?.type && filters.type !== "ALL") {
    where.type = filters.type;
  }

  if (filters?.city && filters.city !== "ALL") {
    where.city = filters.city;
  }

  if (filters?.dateFrom || filters?.dateTo) {
    where.createdAt = {};
    if (filters?.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
    if (filters?.dateTo) {
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59, 999);
      where.createdAt.lte = to;
    }
  }

  if (filters?.expiryFrom || filters?.expiryTo) {
    where.teraExpiryDate = {};
    if (filters?.expiryFrom) where.teraExpiryDate.gte = new Date(filters.expiryFrom);
    if (filters?.expiryTo) {
      const to = new Date(filters.expiryTo);
      to.setHours(23, 59, 59, 999);
      where.teraExpiryDate.lte = to;
    }
  }

  return prisma.equipment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      type: true,
      brand: true,
      model: true,
      serialNumber: true,
      barcode: true,
      capacity: true,
      ownerName: true,
      businessName: true,
      city: true,
      district: true,
      province: true,
      status: true,
      teraExpiryDate: true,
      lastTeraDate: true,
      createdAt: true,
    },
  });
}

export async function getReportFilterOptions() {
  const session = await auth();
  if (!session?.user?.organizationId) return { types: [], cities: [] };

  const [types, cities] = await Promise.all([
    prisma.equipment.findMany({
      where: { organizationId: session.user.organizationId },
      select: { type: true },
      distinct: ["type"],
    }),
    prisma.equipment.findMany({
      where: {
        organizationId: session.user.organizationId,
        city: { not: null },
      },
      select: { city: true },
      distinct: ["city"],
    }),
  ]);

  return {
    types: types.map((t) => t.type).sort(),
    cities: cities.map((c) => c.city!).filter(Boolean).sort(),
  };
}
