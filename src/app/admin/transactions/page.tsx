import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAllTransactions } from "@/actions/subscription";
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
import { CreditCard, CheckCircle, Clock, XCircle } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

export default async function AdminTransactionsPage() {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const transactions = (await getAllTransactions()) as any[];

  const totalRevenue = transactions
    .filter((t) => t.status === "PAID")
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  const totalPending = transactions.filter((t) => t.status === "PENDING").length;
  const totalPaid = transactions.filter((t) => t.status === "PAID").length;

  const statusConfig: Record<string, { icon: any; variant: any; label: string }> = {
    PENDING: { icon: Clock, variant: "secondary", label: "Pending" },
    PAID: { icon: CheckCircle, variant: "default", label: "Paid" },
    FAILED: { icon: XCircle, variant: "destructive", label: "Failed" },
    EXPIRED: { icon: XCircle, variant: "outline", label: "Expired" },
    REFUNDED: { icon: XCircle, variant: "outline", label: "Refunded" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CreditCard className="h-6 w-6 text-red-600" />
        <div>
          <h1 className="text-2xl font-bold">Transaksi</h1>
          <p className="text-muted-foreground">
            Semua transaksi pembayaran di platform
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <CreditCard className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              <p className="text-sm text-muted-foreground">Total Pendapatan</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <CheckCircle className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{totalPaid}</p>
              <p className="text-sm text-muted-foreground">Transaksi Sukses</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{totalPending}</p>
              <p className="text-sm text-muted-foreground">Menunggu Bayar</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Organisasi</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Ref Duitku</TableHead>
                <TableHead>Tanggal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx: any) => {
                const config = statusConfig[tx.status] || statusConfig.PENDING;
                const StatusIcon = config.icon;
                return (
                  <TableRow key={tx.id}>
                    <TableCell className="font-mono text-sm">{tx.merchantOrderId}</TableCell>
                    <TableCell className="font-medium">
                      {tx.organization?.name || "-"}
                    </TableCell>
                    <TableCell>{formatCurrency(tx.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={config.variant} className="gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">
                      {tx.description || "-"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {tx.duitkuReference || "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(new Date(tx.createdAt))}
                    </TableCell>
                  </TableRow>
                );
              })}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Belum ada transaksi
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
