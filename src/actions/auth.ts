"use server";

import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema, setupPasswordSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { sendPasswordResetEmail, sendVerificationEmail, sendGovernmentRegistrationEmail, SUPPORT_EMAIL } from "@/lib/email";
import crypto from "crypto";

function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = loginSchema.safeParse({ email, password });
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { organization: true },
  });

  // Block login if organization is not ACTIVE (e.g. GOVERNMENT pending approval)
  if (user?.organization && user.organization.orgStatus !== "ACTIVE") {
    const statusMessages: Record<string, string> = {
      PENDING_APPROVAL: `Akun instansi Anda menunggu persetujuan admin. Silakan kirim Surat Kuasa ke ${SUPPORT_EMAIL}.`,
      REJECTED: `Pendaftaran instansi Anda ditolak. Hubungi ${SUPPORT_EMAIL} untuk informasi lebih lanjut.`,
      SUSPENDED: `Akun organisasi Anda ditangguhkan. Hubungi ${SUPPORT_EMAIL}.`,
    };
    return { error: statusMessages[user.organization.orgStatus] || "Akun organisasi tidak aktif." };
  }

  // Check if email is verified before login (non-instansi flow)
  if (user && !user.emailVerified && user.organization?.type !== "GOVERNMENT") {
    return { error: "Email belum diverifikasi. Silakan cek inbox Anda." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch {
    return { error: "Email atau password salah" };
  }

  redirect("/dashboard");
}

export async function registerAction(formData: FormData) {
  const data = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
    organizationName: formData.get("organizationName") as string,
    organizationType: formData.get("organizationType") as string,
  };

  const result = registerSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  // Check existing user
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    return { error: "Email sudah terdaftar" };
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);
  const verificationToken = uuidv4();
  const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Create organization + owner user + free subscription in a transaction
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await prisma.$transaction(async (tx: any) => {
    const org = await tx.organization.create({
      data: {
        name: data.organizationName,
        type: data.organizationType,
        email: data.email,
        orgStatus: data.organizationType === "GOVERNMENT" ? "PENDING_APPROVAL" : "ACTIVE",
      },
    });

    // Copy global (default) templates to this organization at signup
    // so they can edit templates without affecting global defaults.
    const globalTemplates = await tx.documentTemplate.findMany({
      where: { isDefault: true, organizationId: null },
      orderBy: { createdAt: "desc" },
    });

    if (globalTemplates.length > 0) {
      await tx.documentTemplate.createMany({
        data: globalTemplates.map((t: any) => ({
          organizationId: org.id,
          name: String(t.name)
            .replace(/^Global\s*-\s*/i, "")
            .replace(/\s*\(Default\)\s*$/i, "")
            .trim(),
          type: t.type,
          headerHtml: t.headerHtml,
          bodyHtml: t.bodyHtml,
          footerHtml: t.footerHtml,
          isDefault: false,
        })),
      });
    }

    const isGovernmentOrg = data.organizationType === "GOVERNMENT";

    await tx.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: "ORGANIZATION_OWNER",
        organizationId: org.id,
        // Instansi pemerintah diverifikasi via approval super admin, bukan via email-link.
        emailVerified: isGovernmentOrg ? true : false,
        verificationToken: isGovernmentOrg ? null : verificationToken,
        verificationExpiry: isGovernmentOrg ? null : verificationExpiry,
      },
    });

    await tx.subscription.create({
      data: {
        organizationId: org.id,
        status: "TRIAL",
        planType: "FREE",
        maxEquipment: 10,
      },
    });
  });

  // Send appropriate email based on organization type
  if (data.organizationType === "GOVERNMENT") {
    // Government orgs: send info email (no verification link), they need manual approval
    await sendGovernmentRegistrationEmail(data.email, data.name, data.organizationName);
    return {
      success: true,
      message: `Pendaftaran instansi pemerintah berhasil! Silakan kirim Surat Kuasa ke ${SUPPORT_EMAIL} untuk proses verifikasi. Cek email Anda untuk detail langkah selanjutnya.`,
    };
  }

  // Non-government orgs: send verification email with link
  await sendVerificationEmail(data.email, data.name, verificationToken);

  return {
    success: true,
    message: "Registrasi berhasil! Silakan cek email Anda untuk verifikasi.",
  };
}

export async function resendVerificationEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { organization: true },
  });

  if (!user) return { error: "Email tidak ditemukan" };
  if (user.emailVerified) return { error: "Email sudah terverifikasi" };
  if (user.organization?.type === "GOVERNMENT") {
    return { error: `Akun instansi pemerintah tidak menggunakan verifikasi email. Menunggu persetujuan admin. Hubungi ${SUPPORT_EMAIL}.` };
  }

  const verificationToken = uuidv4();
  const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { verificationToken, verificationExpiry },
  });

  await sendVerificationEmail(email, user.name, verificationToken);

  return { success: true, message: "Email verifikasi telah dikirim ulang." };
}

// ============================================================
// FORGOT / RESET PASSWORD
// ============================================================

export async function requestPasswordResetAction(formData: FormData) {
  const email = (formData.get("email") as string) || "";
  const parsed = forgotPasswordSchema.safeParse({ email });

  // Always return generic success to avoid account enumeration.
  const generic = {
    success: true,
    message: "Jika email terdaftar, link reset password akan dikirim. Silakan cek inbox/spam Anda.",
  };

  if (!parsed.success) {
    return generic;
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return generic;

  const rawToken = uuidv4();
  const tokenHash = sha256Hex(rawToken);
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetTokenHash: tokenHash,
      passwordResetExpiry: expiry,
    },
  });

  // Best-effort email sending
  try {
    await sendPasswordResetEmail(user.email, user.name, rawToken);
  } catch {}

  return generic;
}

export async function resetPasswordAction(formData: FormData) {
  const data = {
    token: (formData.get("token") as string) || "",
    password: (formData.get("password") as string) || "",
    confirmPassword: (formData.get("confirmPassword") as string) || "",
  };

  const parsed = resetPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const tokenHash = sha256Hex(parsed.data.token);
  const user = await prisma.user.findFirst({
    where: { passwordResetTokenHash: tokenHash },
  });

  if (!user) {
    return { error: "Link reset password tidak valid atau sudah digunakan." };
  }

  if (user.passwordResetExpiry && user.passwordResetExpiry < new Date()) {
    return { error: "Link reset password sudah kedaluwarsa. Silakan minta link baru." };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetTokenHash: null,
      passwordResetExpiry: null,
    },
  });

  return { success: true, message: "Password berhasil direset. Silakan login." };
}

export async function verifyEmailAction(token: string) {
  // First check if token exists
  const user = await prisma.user.findFirst({
    where: { verificationToken: token },
    include: { organization: true },
  });

  if (!user) {
    // Token not found - check if it was recently consumed (React StrictMode double-fire)
    return { error: "Token verifikasi tidak valid atau sudah digunakan. Silakan login atau minta kirim ulang." };
  }

  if (user.emailVerified) {
    return { success: true, message: "Email sudah terverifikasi sebelumnya. Silakan login." };
  }

  if (user.organization?.type === "GOVERNMENT") {
    // Hard-block: instansi pemerintah tidak memakai email-link verification.
    return { error: `Akun instansi pemerintah diverifikasi melalui persetujuan admin. Hubungi ${SUPPORT_EMAIL} bila perlu bantuan.` };
  }

  if (user.verificationExpiry && user.verificationExpiry < new Date()) {
    return { error: "Token verifikasi sudah kedaluwarsa. Silakan minta kirim ulang." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationToken: null,
      verificationExpiry: null,
      isActive: true,
    },
  });

  // Send welcome email asynchronously (import dynamically to avoid circular)
  try {
    const { sendWelcomeEmail } = await import("@/lib/email");
    await sendWelcomeEmail(
      user.email,
      user.name,
      user.organization?.name || "Organisasi"
    );
  } catch {}

  return { success: true, message: "Email berhasil diverifikasi! Silakan login." };
}

// ============================================================
// SETUP PASSWORD (for invited users)
// ============================================================

export async function setupPasswordAction(formData: FormData) {
  const data = {
    token: formData.get("token") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const result = setupPasswordSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const user = await prisma.user.findFirst({
    where: { passwordSetupToken: data.token },
    include: { organization: true },
  });

  if (!user) {
    return { error: "Link tidak valid atau sudah digunakan." };
  }

  if (user.passwordSetupExpiry && user.passwordSetupExpiry < new Date()) {
    return { error: "Link setup password sudah kedaluwarsa. Hubungi admin organisasi Anda." };
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordSetupToken: null,
      passwordSetupExpiry: null,
      emailVerified: true,
      verificationToken: null,
      verificationExpiry: null,
      isActive: true,
    },
  });

  // Send welcome email
  try {
    const { sendWelcomeEmail } = await import("@/lib/email");
    await sendWelcomeEmail(
      user.email,
      user.name,
      user.organization?.name || "Organisasi"
    );
  } catch {}

  return { success: true, message: "Password berhasil diatur! Silakan login." };
}

export async function logoutAction() {
  await signOut({ redirect: false });
  redirect("/login");
}
