"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getPlans() {
  const plans = await prisma.plan.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return plans;
}

export async function createPlan(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const slug = (formData.get("slug") as string) || name.toLowerCase().replace(/\s+/g, "-");
  const monthlyPrice = parseInt(formData.get("monthlyPrice") as string) || 0;
  const quarterlyPrice = parseInt(formData.get("quarterlyPrice") as string) || 0;
  const semiAnnualPrice = parseInt(formData.get("semiAnnualPrice") as string) || 0;
  const annualPrice = parseInt(formData.get("annualPrice") as string) || 0;
  const equipmentLimit = parseInt(formData.get("equipmentLimit") as string) || 10;
  const userLimit = parseInt(formData.get("userLimit") as string) || 2;
  const description = formData.get("description") as string || null;
  const featuresRaw = formData.get("features") as string || "[]";
  const isPopular = formData.get("isPopular") === "true";
  const isActive = formData.get("isActive") !== "false";
  const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;

  let features: string[];
  try {
    features = JSON.parse(featuresRaw);
  } catch {
    features = featuresRaw.split("\n").map((f) => f.trim()).filter(Boolean);
  }

  try {
    await prisma.plan.create({
      data: {
        name,
        slug,
        monthlyPrice,
        quarterlyPrice,
        semiAnnualPrice,
        annualPrice,
        equipmentLimit,
        userLimit,
        description,
        features,
        isPopular,
        isActive,
        sortOrder,
      },
    });
    return { success: true };
  } catch (error: any) {
    if (error?.code === "P2002") {
      return { error: "Slug sudah digunakan" };
    }
    return { error: "Gagal membuat plan" };
  }
}

export async function updatePlan(id: string, formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const monthlyPrice = parseInt(formData.get("monthlyPrice") as string) || 0;
  const quarterlyPrice = parseInt(formData.get("quarterlyPrice") as string) || 0;
  const semiAnnualPrice = parseInt(formData.get("semiAnnualPrice") as string) || 0;
  const annualPrice = parseInt(formData.get("annualPrice") as string) || 0;
  const equipmentLimit = parseInt(formData.get("equipmentLimit") as string) || 10;
  const userLimit = parseInt(formData.get("userLimit") as string) || 2;
  const description = formData.get("description") as string || null;
  const featuresRaw = formData.get("features") as string || "[]";
  const isPopular = formData.get("isPopular") === "true";
  const isActive = formData.get("isActive") !== "false";
  const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;

  let features: string[];
  try {
    features = JSON.parse(featuresRaw);
  } catch {
    features = featuresRaw.split("\n").map((f) => f.trim()).filter(Boolean);
  }

  try {
    await prisma.plan.update({
      where: { id },
      data: {
        name,
        slug,
        monthlyPrice,
        quarterlyPrice,
        semiAnnualPrice,
        annualPrice,
        equipmentLimit,
        userLimit,
        description,
        features,
        isPopular,
        isActive,
        sortOrder,
      },
    });
    return { success: true };
  } catch (error: any) {
    if (error?.code === "P2002") {
      return { error: "Slug sudah digunakan" };
    }
    return { error: "Gagal mengupdate plan" };
  }
}

export async function deletePlan(id: string) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.plan.delete({ where: { id } });
    return { success: true };
  } catch {
    return { error: "Gagal menghapus plan" };
  }
}
