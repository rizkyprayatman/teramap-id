import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCallbackSignature } from "@/lib/duitku";
import { sendPaymentSuccessEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      merchantCode,
      amount,
      merchantOrderId,
      resultCode,
      reference,
      signature,
    } = body;

    // Verify signature
    const isValid = verifyCallbackSignature(
      merchantCode,
      String(amount),
      merchantOrderId,
      signature,
    );

    if (!isValid) {
      console.error("[Duitku Webhook] Invalid signature for order:", merchantOrderId);
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // Find the transaction
    const transaction = await prisma.transaction.findFirst({
      where: { merchantOrderId },
      include: { organization: true },
    });

    if (!transaction) {
      console.error("[Duitku Webhook] Transaction not found:", merchantOrderId);
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // resultCode: "00" = success, "01" = pending, "02" = failed/canceled
    if (resultCode === "00") {
      // Payment successful
      await prisma.$transaction(async (tx) => {
        // Update transaction status
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: "SUCCESS",
            duitkuReference: reference || transaction.duitkuReference,
          },
        });

        // Update subscription to PRO using billingMonths from transaction
        const billingMonths = transaction.billingMonths || 1;
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + billingMonths);

        await tx.subscription.updateMany({
          where: { organizationId: transaction.organizationId },
          data: {
            planType: "PRO",
            status: "ACTIVE",
            maxEquipment: 999999,
            startDate: new Date(),
            endDate,
          },
        });

        // Create notification
        await tx.notification.create({
          data: {
            organizationId: transaction.organizationId,
            title: "Upgrade Berhasil!",
            message: `Pembayaran ${merchantOrderId} berhasil. Akun Anda telah diupgrade ke Pro Plan.`,
            type: "PAYMENT",
          },
        });
      });

      console.log("[Duitku Webhook] Payment successful:", merchantOrderId);

      // Send payment success email to org email and all users
      try {
        const org = transaction.organization;
        const emailsToSend = new Set<string>();
        if (org?.email) emailsToSend.add(org.email);

        const orgUsers = await prisma.user.findMany({
          where: { organizationId: transaction.organizationId, isActive: true, emailVerified: true },
          select: { email: true },
        });
        orgUsers.forEach((u) => emailsToSend.add(u.email));

        for (const email of Array.from(emailsToSend)) {
          await sendPaymentSuccessEmail(
            email,
            org?.name || "Organisasi",
            Number(amount).toLocaleString("id-ID"),
            merchantOrderId
          );
        }
      } catch (emailErr) {
        console.error("[Duitku Webhook] Failed to send payment email:", emailErr);
      }
    } else if (resultCode === "02") {
      // Payment failed
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "FAILED" },
      });

      console.log("[Duitku Webhook] Payment failed:", merchantOrderId);
    }
    // resultCode "01" = still pending, no action needed

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Duitku Webhook] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ status: "ok", service: "duitku-webhook" });
}
