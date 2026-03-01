"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createUserSchema, updateUserSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { sendUserInvitationEmail } from "@/lib/email";

export async function getOrganizationUsers() {
  const session = await auth();
  if (!session?.user?.organizationId) return [];

  return prisma.user.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      avatarUrl: true,
      createdAt: true,
    },
  });
}

export async function createUser(formData: FormData) {
  const session = await auth();
  if (!session?.user?.organizationId) return { error: "Tidak terautentikasi" };
  if (session.user.role !== "ORGANIZATION_OWNER" && session.user.role !== "SUPER_ADMIN") {
    return { error: "Tidak memiliki akses" };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;

  if (!name || !email || !role) {
    return { error: "Nama, email, dan role wajib diisi" };
  }

  // Check free plan user limits
  const subscription = await prisma.subscription.findUnique({
    where: { organizationId: session.user.organizationId },
  });
  
  if (subscription?.planType === "FREE") {
    const existingUsers = await prisma.user.findMany({
      where: { organizationId: session.user.organizationId },
      select: { role: true },
    });

    const staffCount = existingUsers.filter((u) => u.role === "STAFF").length;
    const adminCount = existingUsers.filter((u) => u.role === "ADMIN_INSTANSI").length;
    const viewerCount = existingUsers.filter((u) => u.role === "VIEWER").length;

    if (role === "STAFF" && staffCount >= 5) {
      return { error: "Free plan hanya bisa menambahkan maksimal 5 akun Staff" };
    }
    if (role === "ADMIN_INSTANSI" && adminCount >= 1) {
      return { error: "Free plan hanya bisa menambahkan 1 akun Admin Instansi" };
    }
    if (role === "VIEWER" && viewerCount >= 2) {
      return { error: "Free plan hanya bisa menambahkan maksimal 2 akun Viewer" };
    }
  }

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) return { error: "Email sudah terdaftar" };

  const passwordSetupToken = uuidv4();
  const passwordSetupExpiry = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours
  const verificationToken = uuidv4();
  const verificationExpiry = new Date(Date.now() + 72 * 60 * 60 * 1000);

  // Temporary password (user will set their own via setup link)
  const tempPassword = await bcrypt.hash(uuidv4(), 12);

  // Get org name for email
  const org = await prisma.organization.findUnique({
    where: { id: session.user.organizationId },
    select: { name: true },
  });

  await prisma.user.create({
    data: {
      name,
      email,
      password: tempPassword,
      role: role as any,
      organizationId: session.user.organizationId,
      emailVerified: false,
      verificationToken,
      verificationExpiry,
      passwordSetupToken,
      passwordSetupExpiry,
    },
  });

  // Send invitation email with setup link
  await sendUserInvitationEmail(
    email,
    name,
    org?.name || "Organisasi",
    passwordSetupToken
  );

  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function updateUser(userId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.organizationId) return { error: "Tidak terautentikasi" };
  if (session.user.role !== "ORGANIZATION_OWNER" && session.user.role !== "SUPER_ADMIN") {
    return { error: "Tidak memiliki akses" };
  }

  const data: Record<string, any> = {};
  const name = formData.get("name") as string;
  const role = formData.get("role") as string;
  const isActive = formData.get("isActive");

  if (name) data.name = name;
  if (role) data.role = role;
  if (isActive !== null) data.isActive = isActive === "true";

  await prisma.user.update({
    where: { id: userId, organizationId: session.user.organizationId },
    data,
  });

  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function deleteUser(userId: string) {
  const session = await auth();
  if (!session?.user?.organizationId) return { error: "Tidak terautentikasi" };
  if (session.user.role !== "ORGANIZATION_OWNER" && session.user.role !== "SUPER_ADMIN") {
    return { error: "Tidak memiliki akses" };
  }

  if (userId === session.user.id) return { error: "Tidak bisa menghapus diri sendiri" };

  await prisma.user.delete({
    where: { id: userId, organizationId: session.user.organizationId },
  });

  revalidatePath("/dashboard/users");
  return { success: true };
}

// ===== SUPER ADMIN =====

export async function getAllUsers() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") return [];

  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      avatarUrl: true,
      createdAt: true,
      organization: {
        select: { id: true, name: true },
      },
    },
    take: 200,
  });
}

export async function getSystemSettings() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") return null;

  return prisma.systemSetting.findFirst();
}
