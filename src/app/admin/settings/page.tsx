import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSystemSettings } from "@/actions/users";
import { AdminSettingsForm } from "@/components/admin/admin-settings-form";
import { Settings } from "lucide-react";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const settings = await getSystemSettings();
  const serialized = settings ? JSON.parse(JSON.stringify(settings)) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-red-600" />
        <div>
          <h1 className="text-2xl font-bold">Pengaturan Sistem</h1>
          <p className="text-muted-foreground">
            Konfigurasi global platform TERAMAP
          </p>
        </div>
      </div>

      <AdminSettingsForm settings={serialized} />
    </div>
  );
}
