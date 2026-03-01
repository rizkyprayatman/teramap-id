import { getEquipmentById } from "@/actions/equipment";
import { notFound } from "next/navigation";
import { EquipmentDetail } from "@/components/dashboard/equipment-detail";

interface Props {
  params: { id: string };
}

export default async function EquipmentDetailPage({ params }: Props) {
  const equipment = await getEquipmentById(params.id);
  if (!equipment) notFound();

  return <EquipmentDetail equipment={JSON.parse(JSON.stringify(equipment))} />;
}
