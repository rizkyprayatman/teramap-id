import { auth } from "@/lib/auth";
import { getEquipmentStats } from "@/actions/equipment";
import { getOrganization } from "@/actions/organization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, AlertTriangle, CheckCircle2, Clock, TrendingUp, Building2 } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const stats = await getEquipmentStats();
  const org = await getOrganization();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang kembali, {session?.user?.name}
        </p>
      </div>

      {/* Organization Info */}
      {org && (
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{org.name}</h3>
              <p className="text-sm text-muted-foreground">
                {org._count.users} pengguna · {org._count.equipment} alat
              </p>
            </div>
            <Badge variant={org.subscription?.planType === "PRO" ? "default" : "secondary"}>
              {org.subscription?.planType || "FREE"} Plan
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alat</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              alat terdaftar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.active || 0}</div>
            <p className="text-xs text-muted-foreground">
              tera masih berlaku
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.expired || 0}</div>
            <p className="text-xs text-muted-foreground">
              perlu tera ulang
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Segera Expired</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.expiringIn30Days || 0}</div>
            <p className="text-xs text-muted-foreground">
              dalam 30 hari
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <a
              href="/dashboard/equipment"
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
            >
              <Wrench className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Kelola Alat</p>
                <p className="text-xs text-muted-foreground">Tambah & edit alat</p>
              </div>
            </a>
            <a
              href="/dashboard/scanner"
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
            >
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Scan Barcode</p>
                <p className="text-xs text-muted-foreground">Scan & input tera</p>
              </div>
            </a>
            <a
              href="/dashboard/maps"
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
            >
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Lihat Peta</p>
                <p className="text-xs text-muted-foreground">Lokasi alat</p>
              </div>
            </a>
            <a
              href="/dashboard/documents"
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
            >
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Generate Surat</p>
                <p className="text-xs text-muted-foreground">Buat dokumen</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
