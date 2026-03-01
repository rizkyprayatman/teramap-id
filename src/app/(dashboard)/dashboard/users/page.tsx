import { auth } from "@/lib/auth";
import { getOrganizationUsers } from "@/actions/users";
import { UserManager } from "@/components/dashboard/user-manager";

export default async function UsersPage() {
  const [session, users] = await Promise.all([
    auth(),
    getOrganizationUsers(),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
        <p className="text-muted-foreground">
          Tambah, edit, dan kelola pengguna dalam organisasi Anda
        </p>
      </div>
      <UserManager
        users={JSON.parse(JSON.stringify(users))}
        currentUserId={session?.user?.id || ""}
      />
    </div>
  );
}
