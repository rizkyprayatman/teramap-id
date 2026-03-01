"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Plus, Trash2, Edit, Loader2, UserCheck, UserX } from "lucide-react";
import { createUser, updateUser, deleteUser } from "@/actions/users";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  avatarUrl: string | null;
  createdAt: string;
}

export function UserManager({ users, currentUserId }: { users: User[]; currentUserId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [error, setError] = useState("");

  const handleCreate = (formData: FormData) => {
    setError("");
    startTransition(async () => {
      const result = await createUser(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setShowCreate(false);
        router.refresh();
      }
    });
  };

  const handleUpdate = (formData: FormData) => {
    if (!editUser) return;
    setError("");
    startTransition(async () => {
      const result = await updateUser(editUser.id, formData);
      if (result.error) {
        setError(result.error);
      } else {
        setEditUser(null);
        router.refresh();
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Yakin ingin menghapus pengguna ini?")) return;
    startTransition(async () => {
      const result = await deleteUser(id);
      if (result.error) alert(result.error);
      else router.refresh();
    });
  };

  const toggleActive = (user: User) => {
    const fd = new FormData();
    fd.set("isActive", (!user.isActive).toString());
    startTransition(async () => {
      await updateUser(user.id, fd);
      router.refresh();
    });
  };

  const roleVariant: Record<string, "default" | "secondary" | "outline"> = {
    ORGANIZATION_OWNER: "default",
    ADMIN_INSTANSI: "secondary",
    STAFF: "outline",
    VIEWER: "outline",
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{users.length} pengguna</p>
        <Button onClick={() => { setShowCreate(true); setError(""); }}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Pengguna
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pengguna</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bergabung</TableHead>
                <TableHead className="w-[120px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={roleVariant[user.role] || "outline"}>
                      {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <Badge variant="default" className="gap-1">
                        <UserCheck className="h-3 w-3" />
                        Aktif
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <UserX className="h-3 w-3" />
                        Nonaktif
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(new Date(user.createdAt))}</TableCell>
                  <TableCell>
                    {user.id !== currentUserId && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => { setEditUser(user); setError(""); }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleActive(user)}
                          disabled={isPending}
                        >
                          {user.isActive ? (
                            <UserX className="h-4 w-4 text-orange-500" />
                          ) : (
                            <UserCheck className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(user.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Pengguna Baru</DialogTitle>
          </DialogHeader>
          <form action={handleCreate} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label>Nama</Label>
              <Input name="name" required placeholder="Nama lengkap" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input name="email" type="email" required placeholder="user@contoh.com" />
            </div>
            <p className="text-xs text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
              📧 Pengguna akan menerima email undangan dengan link untuk mengatur password sendiri.
            </p>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select name="role" defaultValue="STAFF">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN_INSTANSI">Admin Instansi</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tambah
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Pengguna</DialogTitle>
          </DialogHeader>
          {editUser && (
            <form action={handleUpdate} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label>Nama</Label>
                <Input name="name" defaultValue={editUser.name} required />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select name="role" defaultValue={editUser.role}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN_INSTANSI">Admin Instansi</SelectItem>
                    <SelectItem value="STAFF">Staff</SelectItem>
                    <SelectItem value="VIEWER">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditUser(null)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
