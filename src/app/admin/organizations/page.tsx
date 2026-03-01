import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAllOrganizations } from "@/actions/organization";
import { AdminOrganizationList } from "@/components/admin/admin-org-list";
import { Building2 } from "lucide-react";

export default async function AdminOrganizationsPage() {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const result = await getAllOrganizations();
  const organizations = JSON.parse(JSON.stringify(result || []));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Building2 className="h-6 w-6 text-red-600" />
        <div>
          <h1 className="text-2xl font-bold">Manajemen Organisasi</h1>
          <p className="text-muted-foreground">
            Kelola semua organisasi terdaftar di platform
          </p>
        </div>
      </div>

      <AdminOrganizationList organizations={organizations} />
    </div>
  );
}
