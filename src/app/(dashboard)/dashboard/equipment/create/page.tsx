import { EquipmentForm } from "@/components/dashboard/equipment-form";
import { getOrganization } from "@/actions/organization";

export default async function CreateEquipmentPage() {
  const org = await getOrganization();
  return (
    <EquipmentForm
      mode="create"
      orgDefaultLat={org?.latitude ?? null}
      orgDefaultLng={org?.longitude ?? null}
    />
  );
}
