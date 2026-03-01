import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAllUsers } from "@/actions/users";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Shield, UserCheck, UserX } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/constants";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const users = await getAllUsers();

  const totalActive = users.filter((u: any) => u.isActive).length;
  const totalInactive = users.length - totalActive;

  const roleBadgeVariant = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "destructive" as const;
      case "ORGANIZATION_OWNER":
        return "default" as const;
      case "ADMIN_INSTANSI":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-red-600" />
        <div>
          <h1 className="text-2xl font-bold">Monitor User</h1>
          <p className="text-muted-foreground">
            Pantau semua pengguna di seluruh organisasi
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <Shield className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-sm text-muted-foreground">Total User</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <UserCheck className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{totalActive}</p>
              <p className="text-sm text-muted-foreground">User Aktif</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <UserX className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold">{totalInactive}</p>
              <p className="text-sm text-muted-foreground">User Nonaktif</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Organisasi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Terdaftar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(users as any[]).map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-sm">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={roleBadgeVariant(user.role)}>
                      {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {user.organization?.name || "-"}
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <Badge variant="outline" className="text-green-600 border-green-300">
                        Aktif
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Nonaktif</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(new Date(user.createdAt))}
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Belum ada user terdaftar
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
