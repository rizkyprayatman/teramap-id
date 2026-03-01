import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTeraExpiryReminderEmail } from "@/lib/email";

// Cron job to handle:
// 1. Check for expired equipment tera
// 2. Expire pending transactions older than 24h
// 3. Expire subscriptions past endDate
// 4. Send email reminders for expiring equipment
// Secure with CRON_SECRET header
export async function GET(req: NextRequest) {
  const cronSecret = req.headers.get("x-cron-secret");
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret || cronSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, any> = {};

  try {
    const now = new Date();

    // 1. Update equipment with expired tera
    const expiredEquipment = await prisma.equipment.updateMany({
      where: {
        teraExpiryDate: { lt: now },
        status: { not: "EXPIRED" },
      },
      data: { status: "EXPIRED" },
    });
    results.expiredEquipment = expiredEquipment.count;

    // 2. Expire pending transactions older than 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const expiredTransactions = await prisma.transaction.updateMany({
      where: {
        status: "PENDING",
        createdAt: { lt: twentyFourHoursAgo },
      },
      data: { status: "EXPIRED" },
    });
    results.expiredTransactions = expiredTransactions.count;

    // 3. Expire subscriptions past endDate
    const expiredSubscriptions = await prisma.subscription.updateMany({
      where: {
        status: "ACTIVE",
        planType: "PRO",
        endDate: { lt: now },
      },
      data: {
        status: "EXPIRED",
        planType: "FREE",
        maxEquipment: 10,
      },
    });
    results.expiredSubscriptions = expiredSubscriptions.count;

    // 4. Generate notifications & send email reminders for equipment expiring in 30 days
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const expiringEquipment = await prisma.equipment.findMany({
      where: {
        teraExpiryDate: {
          gt: now,
          lt: thirtyDaysFromNow,
        },
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        type: true,
        organizationId: true,
        teraExpiryDate: true,
      },
    });

    // Group by organization
    const orgEquipmentMap = new Map<string, { name: string; type: string; expiryDate: string }[]>();
    for (const eq of expiringEquipment) {
      const orgId = eq.organizationId;
      if (!orgEquipmentMap.has(orgId)) {
        orgEquipmentMap.set(orgId, []);
      }
      orgEquipmentMap.get(orgId)!.push({
        name: eq.name,
        type: eq.type,
        expiryDate: eq.teraExpiryDate
          ? eq.teraExpiryDate.toLocaleDateString("id-ID")
          : "-",
      });
    }

    let notificationCount = 0;
    let emailsSent = 0;

    for (const [orgId, equipmentList] of Array.from(orgEquipmentMap.entries())) {
      // Check if notification already sent today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const existing = await prisma.notification.findFirst({
        where: {
          organizationId: orgId,
          type: "TERA_EXPIRY",
          createdAt: { gte: today },
        },
      });

      if (!existing) {
        const equipmentNames = equipmentList.map((e) => e.name);

        // Create in-app notification
        await prisma.notification.create({
          data: {
            organizationId: orgId,
            title: "Peringatan Tera Kedaluwarsa",
            message: `${equipmentNames.length} alat akan kedaluwarsa dalam 30 hari: ${equipmentNames.slice(0, 3).join(", ")}${equipmentNames.length > 3 ? ` dan ${equipmentNames.length - 3} lainnya` : ""}.`,
            type: "TERA_EXPIRY",
            emailSent: true,
          },
        });
        notificationCount++;

        // Send email to org email and all org users
        const org = await prisma.organization.findUnique({
          where: { id: orgId },
          select: { name: true, email: true },
        });

        const orgUsers = await prisma.user.findMany({
          where: { organizationId: orgId, isActive: true, emailVerified: true },
          select: { email: true },
        });

        // Collect unique emails: org email + all user emails
        const emailsToSend = new Set<string>();
        if (org?.email) emailsToSend.add(org.email);
        orgUsers.forEach((u) => emailsToSend.add(u.email));

        for (const email of Array.from(emailsToSend)) {
          try {
            await sendTeraExpiryReminderEmail(
              email,
              org?.name || "Organisasi",
              equipmentList
            );
            emailsSent++;
          } catch (err) {
            console.error(`[Cron] Failed to send email to ${email}:`, err);
          }
        }
      }
    }

    results.notificationsSent = notificationCount;
    results.emailsSent = emailsSent;

    console.log("[Cron] Job completed:", results);
    return NextResponse.json({ success: true, results, timestamp: now.toISOString() });
  } catch (error) {
    console.error("[Cron] Error:", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
