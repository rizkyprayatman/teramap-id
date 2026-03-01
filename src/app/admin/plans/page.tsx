import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPlans } from "@/actions/plans";
import { AdminPlanManager } from "@/components/admin/admin-plan-manager";
import { CreditCard } from "lucide-react";

export default async function AdminPlansPage() {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const plans = await getPlans();
  const serialized = JSON.parse(JSON.stringify(plans));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CreditCard className="h-6 w-6 text-red-600" />
        <div>
          <h1 className="text-2xl font-bold">Kelola Paket Langganan</h1>
          <p className="text-muted-foreground">
            Tambah, edit, atau hapus paket langganan yang ditampilkan di landing page
          </p>
        </div>
      </div>

      <AdminPlanManager plans={serialized} />
    </div>
  );
}
