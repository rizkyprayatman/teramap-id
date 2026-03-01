import { getEquipment } from "@/actions/equipment";
import { getOrganization } from "@/actions/organization";
import { getReportFilterOptions } from "@/actions/reports";
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
import { BarChart3, CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ReportFilters } from "@/components/dashboard/report-filters";

export default async function ReportsPage() {
  const [equipment, org, filterOptions] = await Promise.all([
    getEquipment(),
    getOrganization(),
    getReportFilterOptions(),
  ]);

  const eqList = equipment as any[];
  const activeCount = eqList.filter((e) => e.status === "ACTIVE").length;
  const expiredCount = eqList.filter((e) => e.status === "EXPIRED").length;
  const pendingCount = eqList.filter((e) => e.status === "PENDING").length;
  const suspendedCount = eqList.filter((e) => e.status === "SUSPENDED").length;

  const now = new Date();
  const expiringIn30 = eqList.filter((e) => {
    if (!e.teraExpiryDate) return false;
    const exp = new Date(e.teraExpiryDate);
    const diff = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 30;
  });

  // Group by type
  const byType: Record<string, number> = {};
  eqList.forEach((e) => {
    byType[e.type] = (byType[e.type] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Laporan</h1>
        <p className="text-muted-foreground">
          Statistik dan laporan alat UTTP untuk {org?.name}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Aktif</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{expiredCount}</p>
              <p className="text-xs text-muted-foreground">Expired</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Bersyarat</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{expiringIn30.length}</p>
              <p className="text-xs text-muted-foreground">Segera Expired</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* By Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Alat per Jenis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(byType)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm">{type}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${(count / eqList.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters + Table + Excel Export */}
      <ReportFilters
        filterOptions={filterOptions}
        orgName={org?.name || "Organisasi"}
      />

      {/* Expiring Soon Table */}
      {expiringIn30.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">
              ⚠️ Alat yang Segera Kadaluarsa (30 Hari)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Barcode</TableHead>
                  <TableHead>Kadaluarsa</TableHead>
                  <TableHead>Sisa Hari</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiringIn30.map((eq: any) => {
                  const days = Math.ceil(
                    (new Date(eq.teraExpiryDate).getTime() - now.getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  return (
                    <TableRow key={eq.id}>
                      <TableCell className="font-medium">{eq.name}</TableCell>
                      <TableCell>{eq.type}</TableCell>
                      <TableCell className="font-mono text-xs">{eq.barcode}</TableCell>
                      <TableCell>{formatDate(new Date(eq.teraExpiryDate))}</TableCell>
                      <TableCell>
                        <Badge variant={days <= 7 ? "destructive" : "secondary"}>
                          {days} hari
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
