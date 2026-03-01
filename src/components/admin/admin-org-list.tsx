"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, Ban, CheckCircle, Loader2, XCircle, Clock } from "lucide-react";
import { suspendOrganization, unsuspendOrganization, approveOrganization, rejectOrganization } from "@/actions/organization";
import { formatDate } from "@/lib/utils";

interface Organization {
  id: string;
  name: string;
  type: string;
  email: string | null;
  isSuspended: boolean;
  orgStatus: string;
  rejectionReason: string | null;
  createdAt: string;
  _count: { users: number; equipment: number };
  subscription: { planType: string; status: string } | null;
}

export function AdminOrganizationList({ organizations }: { organizations: Organization[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectOrgId, setRejectOrgId] = useState<string>("");
  const [rejectReason, setRejectReason] = useState("");

  const pendingCount = organizations.filter((o) => o.orgStatus === "PENDING_APPROVAL").length;

  const filtered = organizations.filter((o) => {
    const isSuspended = o.isSuspended || o.orgStatus === "SUSPENDED";
    const matchSearch =
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      (o.email || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "ALL" ||
      (statusFilter === "PENDING" && o.orgStatus === "PENDING_APPROVAL") ||
      (statusFilter === "ACTIVE" && o.orgStatus === "ACTIVE" && !isSuspended) ||
      (statusFilter === "REJECTED" && o.orgStatus === "REJECTED") ||
      (statusFilter === "SUSPENDED" && isSuspended);
    return matchSearch && matchStatus;
  });

  const handleToggleSuspend = (org: Organization) => {
    const isSuspended = org.isSuspended || org.orgStatus === "SUSPENDED";
    startTransition(async () => {
      if (isSuspended) {
        await unsuspendOrganization(org.id);
      } else {
        await suspendOrganization(org.id);
      }
      router.refresh();
    });
  };

  const handleApprove = (orgId: string) => {
    startTransition(async () => {
      await approveOrganization(orgId);
      router.refresh();
    });
  };

  const handleRejectClick = (orgId: string) => {
    setRejectOrgId(orgId);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) return;
    startTransition(async () => {
      await rejectOrganization(rejectOrgId, rejectReason);
      setRejectDialogOpen(false);
      router.refresh();
    });
  };

  const getStatusBadge = (org: Organization) => {
    if (org.isSuspended || org.orgStatus === "SUSPENDED") return <Badge variant="destructive">Suspended</Badge>;
    switch (org.orgStatus) {
      case "PENDING_APPROVAL":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="mr-1 h-3 w-3" />Menunggu</Badge>;
      case "REJECTED":
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Ditolak</Badge>;
      case "ACTIVE":
        return <Badge variant="outline"><CheckCircle className="mr-1 h-3 w-3" />Aktif</Badge>;
      default:
        return <Badge variant="outline">{org.orgStatus}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {pendingCount > 0 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-sm text-yellow-800">
          <Clock className="h-4 w-4" />
          <span><strong>{pendingCount}</strong> organisasi menunggu persetujuan</span>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => setStatusFilter("PENDING")}
          >
            Lihat
          </Button>
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari organisasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-1">
          {["ALL", "PENDING", "ACTIVE", "REJECTED", "SUSPENDED"].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s)}
            >
              {s === "ALL" ? "Semua" : s === "PENDING" ? "Menunggu" : s === "ACTIVE" ? "Aktif" : s === "REJECTED" ? "Ditolak" : "Suspended"}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Alat</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Terdaftar</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Tidak ada organisasi ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell>{org.type}</TableCell>
                    <TableCell className="text-sm">{org.email || "-"}</TableCell>
                    <TableCell>{org._count.users}</TableCell>
                    <TableCell>{org._count.equipment}</TableCell>
                    <TableCell>
                      <Badge variant={org.subscription?.planType === "PRO" ? "default" : "secondary"}>
                        {org.subscription?.planType || "FREE"}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(org)}</TableCell>
                    <TableCell className="text-sm">{formatDate(new Date(org.createdAt))}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {org.orgStatus === "PENDING_APPROVAL" && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleApprove(org.id)}
                              disabled={isPending}
                            >
                              {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="mr-1 h-3 w-3" />}
                              Setujui
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRejectClick(org.id)}
                              disabled={isPending}
                            >
                              <XCircle className="mr-1 h-3 w-3" />
                              Tolak
                            </Button>
                          </>
                        )}
                        {(org.orgStatus === "ACTIVE" || org.orgStatus === "SUSPENDED" || org.isSuspended) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleSuspend(org)}
                            disabled={isPending}
                          >
                            {isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (org.isSuspended || org.orgStatus === "SUSPENDED") ? (
                              <><CheckCircle className="mr-1 h-3 w-3" />Buka Suspend</>
                            ) : (
                              <><Ban className="mr-1 h-3 w-3" />Suspend</>
                            )}
                          </Button>
                        )}
                        {org.orgStatus === "REJECTED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(org.id)}
                            disabled={isPending}
                          >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Setujui Ulang
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Organisasi</DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan. Organisasi akan diberi tahu tentang penolakan ini.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Alasan penolakan..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={isPending || !rejectReason.trim()}
            >
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
