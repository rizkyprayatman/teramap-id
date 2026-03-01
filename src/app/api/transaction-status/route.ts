import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkTransactionStatus } from "@/lib/duitku";
import { PaymentStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const merchantOrderId = req.nextUrl.searchParams.get("orderId");
  if (!merchantOrderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  try {
    // Find transaction
    const transaction = await prisma.transaction.findFirst({
      where: {
        merchantOrderId,
        organizationId: session.user.organizationId,
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // If already SUCCESS or FAILED, return directly
    if (transaction.status === "SUCCESS" || transaction.status === "FAILED") {
      return NextResponse.json({
        status: transaction.status,
        amount: transaction.amount,
        merchantOrderId: transaction.merchantOrderId,
      });
    }

    // Check with Duitku
    try {
      const result = await checkTransactionStatus(merchantOrderId);
      const statusCode = result.statusCode;

      let newStatus: PaymentStatus = transaction.status;
      if (statusCode === "00") {
        newStatus = PaymentStatus.SUCCESS;
      } else if (statusCode === "02") {
        newStatus = PaymentStatus.FAILED;
      }

      // Update if changed
      if (newStatus !== transaction.status) {
        if (newStatus === PaymentStatus.SUCCESS) {
          // Upgrade subscription as fallback (in case webhook didn't fire)
          const billingMonths = transaction.billingMonths || 1;
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + billingMonths);

          await prisma.$transaction(async (tx) => {
            await tx.transaction.update({
              where: { id: transaction.id },
              data: { status: newStatus },
            });

            // Only upgrade if not already PRO+ACTIVE
            const currentSub = await tx.subscription.findUnique({
              where: { organizationId: transaction.organizationId },
            });
            if (currentSub && (currentSub.planType !== "PRO" || currentSub.status !== "ACTIVE")) {
              await tx.subscription.update({
                where: { organizationId: transaction.organizationId },
                data: {
                  planType: "PRO",
                  status: "ACTIVE",
                  maxEquipment: 999999,
                  startDate: new Date(),
                  endDate,
                },
              });
            }

            // Create notification if not exists
            const existingNotif = await tx.notification.findFirst({
              where: {
                organizationId: transaction.organizationId,
                type: "PAYMENT",
                title: "Upgrade Berhasil!",
                createdAt: { gte: new Date(Date.now() - 60000) },
              },
            });
            if (!existingNotif) {
              await tx.notification.create({
                data: {
                  organizationId: transaction.organizationId,
                  title: "Upgrade Berhasil!",
                  message: `Pembayaran ${merchantOrderId} berhasil. Akun Anda telah diupgrade ke Pro Plan.`,
                  type: "PAYMENT",
                },
              });
            }
          });
        } else {
          await prisma.transaction.update({
            where: { id: transaction.id },
            data: { status: newStatus },
          });
        }
      }

      return NextResponse.json({
        status: newStatus,
        amount: transaction.amount,
        merchantOrderId: transaction.merchantOrderId,
        statusMessage: result.statusMessage || null,
      });
    } catch {
      // If Duitku check fails, return current DB status
      return NextResponse.json({
        status: transaction.status,
        amount: transaction.amount,
        merchantOrderId: transaction.merchantOrderId,
      });
    }
  } catch (error) {
    console.error("[Transaction Status] Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
