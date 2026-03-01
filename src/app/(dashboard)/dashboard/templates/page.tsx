import { getTemplates } from "@/actions/document";
import { TemplateEditor } from "@/components/dashboard/template-editor";

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Template Dokumen</h1>
        <p className="text-muted-foreground">
          Kelola template surat, sertifikat, dan dokumen lainnya
        </p>
      </div>
      <TemplateEditor templates={JSON.parse(JSON.stringify(templates))} />
    </div>
  );
}
