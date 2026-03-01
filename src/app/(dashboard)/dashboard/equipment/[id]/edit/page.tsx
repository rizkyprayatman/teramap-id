import { getEquipmentById } from "@/actions/equipment";
import { notFound } from "next/navigation";
import { EquipmentForm } from "@/components/dashboard/equipment-form";

interface Props {
  params: { id: string };
}

export default async function EditEquipmentPage({ params }: Props) {
  const equipment = await getEquipmentById(params.id);
  if (!equipment) notFound();

  return (
    <EquipmentForm
      mode="edit"
      defaultValues={JSON.parse(JSON.stringify(equipment))}
      orgDefaultLat={equipment.organization?.latitude ?? null}
      orgDefaultLng={equipment.organization?.longitude ?? null}
    />
  );
}
