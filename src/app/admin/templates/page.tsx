import { getGlobalTemplates } from "@/actions/document";
import { AdminTemplateEditor } from "@/components/admin/admin-template-editor";

export default async function AdminTemplatesPage() {
  const templates = await getGlobalTemplates();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Template Global</h1>
        <p className="text-muted-foreground">
          Kelola template dokumen default yang berlaku untuk semua organisasi sebagai fallback
        </p>
      </div>
      <AdminTemplateEditor templates={JSON.parse(JSON.stringify(templates))} />
    </div>
  );
}
