"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { equipmentSchema, teraHistorySchema } from "@/lib/validations";
import { generateBarcode } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function getEquipment(searchQuery?: string) {
  const session = await auth();
  if (!session?.user?.organizationId) return [];

  return prisma.equipment.findMany({
    where: {
      organizationId: session.user.organizationId,
      ...(searchQuery && {
        OR: [
          { name: { contains: searchQuery, mode: "insensitive" } },
          { serialNumber: { contains: searchQuery, mode: "insensitive" } },
          { barcode: { contains: searchQuery, mode: "insensitive" } },
          { type: { contains: searchQuery, mode: "insensitive" } },
        ],
      }),
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { teraHistories: true } },
    },
  });
}

export async function getEquipmentById(id: string) {
  const session = await auth();
  if (!session?.user?.organizationId) return null;

  return prisma.equipment.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
    include: {
      teraHistories: {
        orderBy: { testDate: "desc" },
        take: 20,
      },
      organization: true,
    },
  });
}

export async function getEquipmentByBarcode(barcode: string) {
  const session = await auth();
  if (!session?.user?.organizationId) return null;

  return prisma.equipment.findFirst({
    where: {
      barcode,
      organizationId: session.user.organizationId,
    },
    include: {
      teraHistories: {
        orderBy: { testDate: "desc" },
        take: 5,
      },
      organization: true,
    },
  });
}

export async function createEquipment(formData: FormData) {
  const session = await auth();
  if (!session?.user?.organizationId) return { error: "Tidak terautentikasi" };

  if (session.user.role === "VIEWER") return { error: "Tidak memiliki akses" };

  // Check subscription limit
  const sub = await prisma.subscription.findUnique({
    where: { organizationId: session.user.organizationId },
  });

  if (sub?.planType === "FREE") {
    const count = await prisma.equipment.count({
      where: { organizationId: session.user.organizationId },
    });
    if (count >= (sub.maxEquipment || 10)) {
      return { error: "Batas alat pada Free Plan tercapai (10 alat). Silakan upgrade ke Pro Plan." };
    }
  }

  const data = {
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    brand: (formData.get("brand") as string) || undefined,
    model: (formData.get("model") as string) || undefined,
    serialNumber: formData.get("serialNumber") as string,
    capacity: (formData.get("capacity") as string) || undefined,
    divisionValue: (formData.get("divisionValue") as string) || undefined,
    latitude: formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : undefined,
    longitude: formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : undefined,
    address: (formData.get("address") as string) || undefined,
    street: (formData.get("street") as string) || undefined,
    village: (formData.get("village") as string) || undefined,
    district: (formData.get("district") as string) || undefined,
    city: (formData.get("city") as string) || undefined,
    province: (formData.get("province") as string) || undefined,
    postalCode: (formData.get("postalCode") as string) || undefined,
  };

  const ownerName = (formData.get("ownerName") as string) || undefined;
  const businessName = (formData.get("businessName") as string) || undefined;
  const photoUrl = (formData.get("photoUrl") as string) || undefined;
  const photosJson = formData.get("photos") as string;
  const photos = photosJson ? JSON.parse(photosJson) as string[] : [];

  const result = equipmentSchema.safeParse(data);
  if (!result.success) return { error: result.error.issues[0].message };

  const org = await prisma.organization.findUnique({
    where: { id: session.user.organizationId },
  });

  const barcode = generateBarcode();
  const teraExpiryDate = new Date();
  teraExpiryDate.setDate(teraExpiryDate.getDate() + (org?.defaultTeraValidity || 365));

  await prisma.equipment.create({
    data: {
      ...result.data,
      barcode,
      ownerName,
      businessName,
      photoUrl,
      photos,
      organizationId: session.user.organizationId,
      teraExpiryDate,
      lastTeraDate: new Date(),
    },
  });

  revalidatePath("/dashboard/equipment");
  return { success: true };
}

export async function updateEquipment(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.organizationId) return { error: "Tidak terautentikasi" };
  if (session.user.role === "VIEWER" || session.user.role === "STAFF") {
    return { error: "Tidak memiliki akses" };
  }

  const data = {
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    brand: (formData.get("brand") as string) || undefined,
    model: (formData.get("model") as string) || undefined,
    serialNumber: formData.get("serialNumber") as string,
    capacity: (formData.get("capacity") as string) || undefined,
    divisionValue: (formData.get("divisionValue") as string) || undefined,
    latitude: formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : undefined,
    longitude: formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : undefined,
    address: (formData.get("address") as string) || undefined,
    street: (formData.get("street") as string) || undefined,
    village: (formData.get("village") as string) || undefined,
    district: (formData.get("district") as string) || undefined,
    city: (formData.get("city") as string) || undefined,
    province: (formData.get("province") as string) || undefined,
    postalCode: (formData.get("postalCode") as string) || undefined,
  };

  const ownerName = (formData.get("ownerName") as string) || undefined;
  const businessName = (formData.get("businessName") as string) || undefined;
  const photoUrl = (formData.get("photoUrl") as string) || undefined;
  const photosJson = formData.get("photos") as string;
  const photos = photosJson ? JSON.parse(photosJson) as string[] : undefined;

  const result = equipmentSchema.safeParse(data);
  if (!result.success) return { error: result.error.issues[0].message };

  await prisma.equipment.update({
    where: { id, organizationId: session.user.organizationId },
    data: {
      ...result.data,
      ownerName,
      businessName,
      ...(photoUrl && { photoUrl }),
      ...(photos && { photos }),
    },
  });

  revalidatePath("/dashboard/equipment");
  return { success: true };
}

export async function deleteEquipment(id: string) {
  const session = await auth();
  if (!session?.user?.organizationId) return { error: "Tidak terautentikasi" };
  if (session.user.role === "VIEWER" || session.user.role === "STAFF") {
    return { error: "Tidak memiliki akses" };
  }

  await prisma.equipment.delete({
    where: { id, organizationId: session.user.organizationId },
  });

  revalidatePath("/dashboard/equipment");
  return { success: true };
}

export async function addTeraHistory(formData: FormData) {
  const session = await auth();
  if (!session?.user?.organizationId) return { error: "Tidak terautentikasi" };
  if (session.user.role === "VIEWER") return { error: "Tidak memiliki akses" };

  const data = {
    equipmentId: formData.get("equipmentId") as string,
    testDate: formData.get("testDate") as string,
    result: formData.get("result") as string,
    officerName: formData.get("officerName") as string,
    notes: (formData.get("notes") as string) || undefined,
    latitude: formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : undefined,
    longitude: formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : undefined,
  };

  const result = teraHistorySchema.safeParse(data);
  if (!result.success) return { error: result.error.issues[0].message };

  // Verify equipment belongs to organization
  const equipment = await prisma.equipment.findFirst({
    where: { id: data.equipmentId, organizationId: session.user.organizationId },
    include: { organization: true },
  });

  if (!equipment) return { error: "Alat tidak ditemukan" };

  const teraExpiryDate = new Date(data.testDate);
  teraExpiryDate.setDate(
    teraExpiryDate.getDate() + (equipment.organization.defaultTeraValidity || 365)
  );

  const photoUrl = (formData.get("photoUrl") as string) || undefined;
  const photosJson = formData.get("photos") as string;
  const teraPhotos = photosJson ? JSON.parse(photosJson) as string[] : [];

  await prisma.$transaction([
    prisma.teraHistory.create({
      data: {
        equipmentId: data.equipmentId,
        testDate: new Date(data.testDate),
        result: data.result as any,
        officerName: data.officerName,
        officerId: session.user.id,
        notes: data.notes,
        latitude: data.latitude,
        longitude: data.longitude,
        photoUrl,
        photos: teraPhotos,
      },
    }),
    prisma.equipment.update({
      where: { id: data.equipmentId },
      data: {
        lastTeraDate: new Date(data.testDate),
        teraExpiryDate,
        status: data.result === "PASS" ? "ACTIVE" : data.result === "FAIL" ? "SUSPENDED" : "PENDING",
      },
    }),
  ]);

  revalidatePath("/dashboard/equipment");
  return { success: true };
}

export async function getEquipmentStats() {
  const session = await auth();
  if (!session?.user?.organizationId) return null;

  const [total, active, expired, pending] = await Promise.all([
    prisma.equipment.count({
      where: { organizationId: session.user.organizationId },
    }),
    prisma.equipment.count({
      where: { organizationId: session.user.organizationId, status: "ACTIVE" },
    }),
    prisma.equipment.count({
      where: { organizationId: session.user.organizationId, status: "EXPIRED" },
    }),
    prisma.equipment.count({
      where: { organizationId: session.user.organizationId, status: "PENDING" },
    }),
  ]);

  const expiringIn30Days = await prisma.equipment.count({
    where: {
      organizationId: session.user.organizationId,
      teraExpiryDate: {
        lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        gte: new Date(),
      },
    },
  });

  return { total, active, expired, pending, expiringIn30Days };
}
