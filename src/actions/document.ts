"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { documentTemplateSchema } from "@/lib/validations";
import { generateLetterNumber } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function getTemplates() {
  const session = await auth();
  if (!session?.user?.organizationId) return [];

  // Return org-specific templates, plus global defaults only for types
  // that do not exist in the org yet (prevents duplicates per type).
  const orgTemplates = await prisma.documentTemplate.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: { createdAt: "desc" },
  });

  const orgTypes = new Set(orgTemplates.map((t) => t.type));
  const globalTemplates = await prisma.documentTemplate.findMany({
    where: {
      isDefault: true,
      organizationId: null,
      ...(orgTypes.size > 0 ? { type: { notIn: Array.from(orgTypes) } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return [...orgTemplates, ...globalTemplates];
}

/**
 * Get template by type, prioritizing org-specific over global default
 */
export async function getTemplateByType(type: string) {
  const session = await auth();
  if (!session?.user?.organizationId) return null;

  // First try org-specific template
  const orgTemplate = await prisma.documentTemplate.findFirst({
    where: {
      type,
      organizationId: session.user.organizationId,
    },
    orderBy: { createdAt: "desc" },
  });

  if (orgTemplate) return orgTemplate;

  // Fallback to global default template
  return prisma.documentTemplate.findFirst({
    where: {
      type,
      isDefault: true,
      organizationId: null,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createTemplate(formData: FormData) {
  const session = await auth();
  if (!session?.user?.organizationId) return { error: "Tidak terautentikasi" };
  if (session.user.role === "VIEWER" || session.user.role === "STAFF") {
    return { error: "Tidak memiliki akses" };
  }

  const data = {
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    headerHtml: formData.get("headerHtml") as string,
    bodyHtml: formData.get("bodyHtml") as string,
    footerHtml: formData.get("footerHtml") as string,
  };

  const result = documentTemplateSchema.safeParse(data);
  if (!result.success) return { error: result.error.issues[0].message };

  await prisma.documentTemplate.create({
    data: {
      ...result.data,
      organizationId: session.user.organizationId,
    },
  });

  revalidatePath("/dashboard/templates");
  return { success: true };
}

export async function updateTemplate(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.organizationId) return { error: "Tidak terautentikasi" };
  if (session.user.role === "VIEWER" || session.user.role === "STAFF") {
    return { error: "Tidak memiliki akses" };
  }

  const data = {
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    headerHtml: formData.get("headerHtml") as string,
    bodyHtml: formData.get("bodyHtml") as string,
    footerHtml: formData.get("footerHtml") as string,
  };

  const result = documentTemplateSchema.safeParse(data);
  if (!result.success) return { error: result.error.issues[0].message };

  await prisma.documentTemplate.update({
    where: { id, organizationId: session.user.organizationId },
    data: result.data,
  });

  revalidatePath("/dashboard/templates");
  return { success: true };
}

export async function deleteTemplate(id: string) {
  const session = await auth();
  if (!session?.user?.organizationId) return { error: "Tidak terautentikasi" };
  if (session.user.role === "VIEWER" || session.user.role === "STAFF") {
    return { error: "Tidak memiliki akses" };
  }

  await prisma.documentTemplate.delete({
    where: { id, organizationId: session.user.organizationId },
  });

  revalidatePath("/dashboard/templates");
  return { success: true };
}

// ============================================================
// SUPER ADMIN - Global Template Management
// ============================================================

export async function getGlobalTemplates() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") return [];

  return prisma.documentTemplate.findMany({
    where: { isDefault: true, organizationId: null },
    orderBy: { createdAt: "desc" },
  });
}

export async function createGlobalTemplate(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { error: "Tidak memiliki akses" };
  }

  const data = {
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    headerHtml: formData.get("headerHtml") as string,
    bodyHtml: formData.get("bodyHtml") as string,
    footerHtml: formData.get("footerHtml") as string,
  };

  const result = documentTemplateSchema.safeParse(data);
  if (!result.success) return { error: result.error.issues[0].message };

  await prisma.documentTemplate.create({
    data: {
      ...result.data,
      isDefault: true,
      organizationId: null,
    },
  });

  revalidatePath("/admin/templates");
  return { success: true };
}

export async function updateGlobalTemplate(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { error: "Tidak memiliki akses" };
  }

  const data = {
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    headerHtml: formData.get("headerHtml") as string,
    bodyHtml: formData.get("bodyHtml") as string,
    footerHtml: formData.get("footerHtml") as string,
  };

  const result = documentTemplateSchema.safeParse(data);
  if (!result.success) return { error: result.error.issues[0].message };

  await prisma.documentTemplate.update({
    where: { id },
    data: result.data,
  });

  revalidatePath("/admin/templates");
  return { success: true };
}

export async function deleteGlobalTemplate(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { error: "Tidak memiliki akses" };
  }

  await prisma.documentTemplate.delete({ where: { id } });

  revalidatePath("/admin/templates");
  return { success: true };
}

export async function generateDocumentData(equipmentId: string, _docType?: string) {
  const session = await auth();
  if (!session?.user?.organizationId) return null;

  const [equipment, org] = await Promise.all([
    prisma.equipment.findFirst({
      where: { id: equipmentId, organizationId: session.user.organizationId },
      include: { teraHistories: { orderBy: { testDate: "desc" }, take: 1 } },
    }),
    prisma.organization.findUnique({
      where: { id: session.user.organizationId },
    }),
  ]);

  if (!equipment || !org) return null;

  // Generate letter number
  const counter = org.letterNumberCounter + 1;
  await prisma.organization.update({
    where: { id: org.id },
    data: { letterNumberCounter: counter },
  });

  const letterNumber = generateLetterNumber(
    org.letterNumberPrefix || "TERA",
    counter,
    org.letterNumberMiddle || undefined,
    org.letterNumberSuffix || undefined
  );
  const latestTera = equipment.teraHistories[0];

  return {
    letterNumber,
    organization: org,
    equipment,
    latestTera,
  };
}
