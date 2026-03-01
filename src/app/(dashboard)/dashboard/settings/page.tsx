import { getOrganization } from "@/actions/organization";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const org = await getOrganization();
  if (!org) redirect("/dashboard");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="text-muted-foreground">
          Konfigurasi organisasi, tera, dan tanda tangan dokumen
        </p>
      </div>
      <SettingsForm org={JSON.parse(JSON.stringify(org))} />
    </div>
  );
}
