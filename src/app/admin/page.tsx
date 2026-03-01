import { getGlobalStats, getAllOrganizations } from "@/actions/organization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2, Users, Wrench, CreditCard, TrendingUp, DollarSign, Activity } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [stats, organizations] = await Promise.all([
    getGlobalStats(),
    getAllOrganizations(),
  ]);

  const orgs = (organizations || []) as any[];
  const recentOrgs = orgs.slice(0, 10);

  const proOrgs = orgs.filter((o: any) => o.subscription?.planType === "PRO").length;
  const freeOrgs = orgs.length - proOrgs;
  const suspendedOrgs = orgs.filter((o: any) => o.isSuspended).length;
  const totalEquipment = orgs.reduce((sum: number, o: any) => sum + (o._count?.equipment || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Global</h1>
        <p className="text-muted-foreground">
          Monitoring seluruh organisasi dan data platform TERAMAP
        </p>
      </div>

      {/* Stats Row 1 */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organisasi</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.orgCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {proOrgs} Pro &middot; {freeOrgs} Free
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total User</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.userCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {orgs.length > 0 ? (stats?.userCount ? (stats.userCount / orgs.length).toFixed(1) : 0) : 0} user/organisasi
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alat</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.equipmentCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {orgs.length > 0 ? (totalEquipment / orgs.length).toFixed(1) : 0} alat/organisasi
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.activeSubscriptions || 0} langganan aktif
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Row 2 */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50/30">
          <CardContent className="pt-6 flex items-center gap-4">
            <Activity className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-700">{proOrgs}</p>
              <p className="text-sm text-green-600">Pro Subscribers</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="pt-6 flex items-center gap-4">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-700">{freeOrgs}</p>
              <p className="text-sm text-blue-600">Free Plan</p>
            </div>
          </CardContent>
        </Card>
        <Card className={suspendedOrgs > 0 ? "border-red-200 bg-red-50/30" : ""}>
          <CardContent className="pt-6 flex items-center gap-4">
            <CreditCard className={`h-8 w-8 ${suspendedOrgs > 0 ? "text-red-600" : "text-muted-foreground"}`} />
            <div>
              <p className={`text-2xl font-bold ${suspendedOrgs > 0 ? "text-red-700" : ""}`}>{suspendedOrgs}</p>
              <p className={`text-sm ${suspendedOrgs > 0 ? "text-red-600" : "text-muted-foreground"}`}>Suspended</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Organizations */}
      <Card>
        <CardHeader>
          <CardTitle>Organisasi Terbaru</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Alat</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Terdaftar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrgs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    Belum ada organisasi
                  </TableCell>
                </TableRow>
              ) : (
                recentOrgs.map((org: any) => (
                  <TableRow key={org.id}>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell>{org.type}</TableCell>
                    <TableCell>{org._count?.users || 0}</TableCell>
                    <TableCell>{org._count?.equipment || 0}</TableCell>
                    <TableCell>
                      <Badge variant={org.subscription?.planType === "PRO" ? "default" : "secondary"}>
                        {org.subscription?.planType || "FREE"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {org.isSuspended ? (
                        <Badge variant="destructive">Suspended</Badge>
                      ) : (
                        <Badge variant="outline">Aktif</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(new Date(org.createdAt))}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
