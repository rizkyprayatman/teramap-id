import { getEquipment } from "@/actions/equipment";
import { EquipmentTable } from "@/components/dashboard/equipment-table";

export default async function EquipmentPage() {
  const equipment = await getEquipment();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Alat UTTP</h1>
        <p className="text-muted-foreground">
          Kelola semua alat Ukur, Takar, Timbang & Perlengkapannya
        </p>
      </div>
      <EquipmentTable initialData={JSON.parse(JSON.stringify(equipment))} />
    </div>
  );
}
