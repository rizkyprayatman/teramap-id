"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { organizationSchema } from "@/lib/validations";
import {
  sendOrganizationApprovedEmail,
  sendOrganizationRejectedEmail,
  sendOrganizationSuspendedEmail,
  sendOrganizationUnsuspendedEmail,
} from "@/lib/email";
import { revalidatePath } from "next/cache";

async function getOrgNotificationEmail(orgId: string): Promise<string | null> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { email: true },
  });
  if (org?.email) return org.email;

  const owner = await prisma.user.findFirst({
    where: { organizationId: orgId, role: "ORGANIZATION_OWNER" },
    select: { email: true },
  });
  return owner?.email || null;
}

async function getOrgNotificationEmails(orgId: string): Promise<string[]> {
  const recipients = new Set<string>();

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { email: true },
  });
  if (org?.email) recipients.add(org.email);

  const owner = await prisma.user.findFirst({
    where: { organizationId: orgId, role: "ORGANIZATION_OWNER" },
    select: { email: true },
  });
  if (owner?.email) recipients.add(owner.email);

  return Array.from(recipients);
}

export async function getOrganization() {
  const session = await auth();
  if (!session?.user?.organizationId) return null;

  return prisma.organization.findUnique({
    where: { id: session.user.organizationId },
    include: {
      subscription: true,
      _count: {
        select: {
          users: true,
          equipment: true,
        },
      },
    },
  });
}

export async function updateOrganization(formData: FormData) {
  const session = await auth();
  if (!session?.user?.organizationId) return { error: "Tidak terautentikasi" };
  if (session.user.role !== "ORGANIZATION_OWNER" && session.user.role !== "SUPER_ADMIN") {
    return { error: "Tidak memiliki akses" };
  }

  const street = (formData.get("street") as string) || undefined;
  const village = (formData.get("village") as string) || undefined;
  const district = (formData.get("district") as string) || undefined;
  const city = (formData.get("city") as string) || undefined;
  const province = (formData.get("province") as string) || undefined;
  const postalCode = (formData.get("postalCode") as string) || undefined;

  // Keep a human-friendly full address for legacy consumers.
  // If separated parts are provided, build `address` from them.
  const addressFromParts = [street, village, district, city, province, postalCode]
    .filter(Boolean)
    .join(", ");

  const latitudeRaw = formData.get("latitude") as string | null;
  const longitudeRaw = formData.get("longitude") as string | null;
  const latitude = latitudeRaw ? parseFloat(latitudeRaw) : undefined;
  const longitude = longitudeRaw ? parseFloat(longitudeRaw) : undefined;

  const data = {
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    address: addressFromParts || ((formData.get("address") as string) || undefined),
    latitude: typeof latitude === "number" && !Number.isNaN(latitude) ? latitude : undefined,
    longitude: typeof longitude === "number" && !Number.isNaN(longitude) ? longitude : undefined,
    street,
    village,
    district,
    city,
    province,
    postalCode,
    phone: (formData.get("phone") as string) || undefined,
    email: (formData.get("email") as string) || undefined,
    logoUrl: (formData.get("logoUrl") as string) || undefined,
    defaultTeraValidity: parseInt(formData.get("defaultTeraValidity") as string) || 365,
    signatureName: (formData.get("signatureName") as string) || undefined,
    signatureTitle: (formData.get("signatureTitle") as string) || undefined,
    signatureName2: (formData.get("signatureName2") as string) || undefined,
    signatureTitle2: (formData.get("signatureTitle2") as string) || undefined,
    signatureName3: (formData.get("signatureName3") as string) || undefined,
    signatureTitle3: (formData.get("signatureTitle3") as string) || undefined,
    letterNumberPrefix: (formData.get("letterNumberPrefix") as string) || undefined,
    letterNumberMiddle: (formData.get("letterNumberMiddle") as string) || undefined,
    letterNumberSuffix: (formData.get("letterNumberSuffix") as string) || undefined,
  };

  const result = organizationSchema.safeParse(data);
  if (!result.success) return { error: result.error.issues[0].message };

  await prisma.organization.update({
    where: { id: session.user.organizationId },
    data: result.data,
  });

  revalidatePath("/dashboard/settings");
  return { success: true };
}

// ===== SUPER ADMIN FUNCTIONS =====

export async function getAllOrganizations() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") return [];

  return prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subscription: true,
      _count: {
        select: {
          users: true,
          equipment: true,
        },
      },
    },
  });
}

export async function suspendOrganization(orgId: string) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") return { error: "Akses ditolak" };

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { id: true, name: true, orgStatus: true },
  });

  if (!org) return { error: "Organisasi tidak ditemukan" };

  await prisma.organization.update({
    where: { id: orgId },
    data: { isSuspended: true, orgStatus: "SUSPENDED" },
  });

  try {
    const to = await getOrgNotificationEmail(orgId);
    if (to) {
      await sendOrganizationSuspendedEmail(to, org.name);
    }
  } catch {
    // Ignore email failures.
  }

  revalidatePath("/admin/organizations");
  return { success: true };
}

export async function unsuspendOrganization(orgId: string) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") return { error: "Akses ditolak" };

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { name: true, orgStatus: true, isSuspended: true },
  });

  if (!org) return { error: "Organisasi tidak ditemukan" };

  // Idempotent: if not suspended anymore, don't spam email.
  if (!org.isSuspended && org.orgStatus !== "SUSPENDED") {
    revalidatePath("/admin/organizations");
    return { success: true };
  }

  await prisma.organization.update({
    where: { id: orgId },
    data: {
      isSuspended: false,
      ...(org?.orgStatus === "SUSPENDED" ? { orgStatus: "ACTIVE" } : {}),
    },
  });

  try {
    const recipients = await getOrgNotificationEmails(orgId);
    await Promise.all(recipients.map((to) => sendOrganizationUnsuspendedEmail(to, org.name)));
  } catch {
    // Ignore email failures.
  }

  revalidatePath("/admin/organizations");
  return { success: true };
}

export async function approveOrganization(orgId: string) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") return { error: "Akses ditolak" };

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { id: true, name: true, email: true, orgStatus: true, isVerified: true },
  });

  if (!org) return { error: "Organisasi tidak ditemukan" };

  // If already approved, keep idempotent and do not re-send.
  if (org.orgStatus === "ACTIVE" && org.isVerified) {
    revalidatePath("/admin/organizations");
    return { success: true };
  }

  await prisma.organization.update({
    where: { id: orgId },
    data: {
      orgStatus: "ACTIVE",
      isVerified: true,
      verifiedAt: new Date(),
      rejectionReason: null,
    },
  });

  // Notify organization via email (fallback to owner email if org email not set)
  try {
    const to = org.email
      ? org.email
      : (await prisma.user.findFirst({
          where: { organizationId: orgId, role: "ORGANIZATION_OWNER" },
          select: { email: true },
        }))?.email;

    if (to) {
      await sendOrganizationApprovedEmail(to, org.name);
    }
  } catch {
    // Ignore email failures so approval still succeeds.
  }

  revalidatePath("/admin/organizations");
  return { success: true };
}

export async function rejectOrganization(orgId: string, reason: string) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") return { error: "Akses ditolak" };

  if (!reason.trim()) return { error: "Alasan penolakan harus diisi" };

  const org = await prisma.organization.update({
    where: { id: orgId },
    data: {
      orgStatus: "REJECTED",
      rejectionReason: reason.trim(),
    },
    select: { name: true },
  });

  try {
    const to = await getOrgNotificationEmail(orgId);
    if (to) {
      await sendOrganizationRejectedEmail(to, org.name, reason.trim());
    }
  } catch {
    // Ignore email failures.
  }

  revalidatePath("/admin/organizations");
  return { success: true };
}

export async function getGlobalStats() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") return null;

  const [orgCount, userCount, equipmentCount, activeSubscriptions, revenue] = await Promise.all([
    prisma.organization.count(),
    prisma.user.count(),
    prisma.equipment.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCESS" },
    }),
  ]);

  return {
    orgCount,
    userCount,
    equipmentCount,
    activeSubscriptions,
    totalRevenue: revenue._sum.amount || 0,
  };
}
