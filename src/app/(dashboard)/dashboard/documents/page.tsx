import { getEquipment } from "@/actions/equipment";
import { getOrganization } from "@/actions/organization";
import dynamic from "next/dynamic";

const DocumentGenerator = dynamic(
  () => import("@/components/dashboard/document-generator").then((m) => m.DocumentGenerator),
  { ssr: false, loading: () => <div className="h-64 rounded-lg animate-pulse bg-muted" /> }
);

export default async function DocumentsPage() {
  const [equipment, org] = await Promise.all([
    getEquipment(),
    getOrganization(),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Generate Surat & Dokumen</h1>
        <p className="text-muted-foreground">
          Generate sertifikat tera, surat keterangan, dan rekapitulasi alat dalam format PDF
        </p>
      </div>
      <DocumentGenerator
        equipment={JSON.parse(JSON.stringify(equipment))}
        orgName={org?.name || ""}
        orgAddress={org?.address || null}
        signatureName={org?.signatureName || null}
        signatureTitle={org?.signatureTitle || null}
      />
    </div>
  );
}
