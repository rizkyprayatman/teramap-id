import { auth } from "@/lib/auth";
import { getSubscription, getTransactionHistory, getSystemPricing } from "@/actions/subscription";
import { SubscriptionManager } from "@/components/dashboard/subscription-manager";

export const dynamic = "force-dynamic";

export default async function SubscriptionPage() {
  const [session, subscription, transactions, pricing] = await Promise.all([
    auth(),
    getSubscription(),
    getTransactionHistory(),
    getSystemPricing(),
  ]);

  const isOwner = session?.user?.role === "ORGANIZATION_OWNER";

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Subscription</h1>
        <p className="text-muted-foreground">
          Kelola paket langganan dan riwayat pembayaran
        </p>
      </div>
      <SubscriptionManager
        subscription={subscription ? JSON.parse(JSON.stringify(subscription)) : null}
        transactions={JSON.parse(JSON.stringify(transactions))}
        isOwner={isOwner}
        pricing={pricing}
      />
    </div>
  );
}
