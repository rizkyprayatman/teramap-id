import { getEquipment } from "@/actions/equipment";
import dynamic from "next/dynamic";

const EquipmentMap = dynamic(
  () => import("@/components/dashboard/equipment-map").then((m) => ({ default: m.EquipmentMap })),
  { ssr: false, loading: () => <div className="h-[500px] rounded-lg border animate-pulse bg-muted" /> }
);

export default async function MapsPage() {
  const equipment = await getEquipment();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Peta Lokasi Alat</h1>
        <p className="text-muted-foreground">
          Visualisasi lokasi semua alat UTTP pada peta interaktif
        </p>
      </div>
      <EquipmentMap equipment={JSON.parse(JSON.stringify(equipment))} />
    </div>
  );
}
