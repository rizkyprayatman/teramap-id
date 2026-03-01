"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Filter, Loader2, Search } from "lucide-react";
import { getReportData } from "@/actions/reports";
import { formatDate } from "@/lib/utils";
import * as XLSX from "xlsx";

interface FilterOptions {
  types: string[];
  cities: string[];
}

interface Equipment {
  id: string;
  name: string;
  type: string;
  brand: string | null;
  model: string | null;
  serialNumber: string;
  barcode: string;
  capacity: string | null;
  ownerName: string | null;
  businessName: string | null;
  city: string | null;
  district: string | null;
  province: string | null;
  status: string;
  teraExpiryDate: string | null;
  lastTeraDate: string | null;
  createdAt: string;
}

const STATUS_MAP: Record<string, { label: string; variant: "default" | "destructive" | "secondary" | "outline" }> = {
  ACTIVE: { label: "Aktif", variant: "default" },
  EXPIRED: { label: "Expired", variant: "destructive" },
  PENDING: { label: "Bersyarat", variant: "secondary" },
  SUSPENDED: { label: "Suspended", variant: "outline" },
};

export function ReportFilters({ filterOptions, orgName }: { filterOptions: FilterOptions; orgName: string }) {
  const [isPending, startTransition] = useTransition();
  const [exporting, setExporting] = useState(false);
  const [data, setData] = useState<Equipment[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [search, setSearch] = useState("");

  // Filter states
  const [status, setStatus] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [city, setCity] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expiryFrom, setExpiryFrom] = useState("");
  const [expiryTo, setExpiryTo] = useState("");

  const handleSearch = () => {
    startTransition(async () => {
      const result = await getReportData({
        status: status !== "ALL" ? status : undefined,
        type: type !== "ALL" ? type : undefined,
        city: city !== "ALL" ? city : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        expiryFrom: expiryFrom || undefined,
        expiryTo: expiryTo || undefined,
      });
      setData(JSON.parse(JSON.stringify(result)));
      setHasSearched(true);
    });
  };

  const handleReset = () => {
    setStatus("ALL");
    setType("ALL");
    setCity("ALL");
    setDateFrom("");
    setDateTo("");
    setExpiryFrom("");
    setExpiryTo("");
    setSearch("");
    setData([]);
    setHasSearched(false);
  };

  // Client-side search within fetched data
  const filteredData = data.filter((eq) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      eq.name.toLowerCase().includes(q) ||
      eq.barcode.toLowerCase().includes(q) ||
      eq.serialNumber.toLowerCase().includes(q) ||
      (eq.ownerName || "").toLowerCase().includes(q) ||
      (eq.businessName || "").toLowerCase().includes(q)
    );
  });

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const headers = [
      "No",
      "Nama Alat",
      "Jenis",
      "Merk",
      "Model",
      "No. Seri",
      "Barcode",
      "Kapasitas",
      "Pemilik",
      "Nama Usaha",
      "Kota",
      "Kecamatan",
      "Provinsi",
      "Status",
      "Tgl Tera Terakhir",
      "Tgl Kadaluarsa",
      "Tgl Terdaftar",
    ];

      const rows = filteredData.map((eq, i) => [
      i + 1,
      eq.name,
      eq.type,
      eq.brand || "",
      eq.model || "",
      eq.serialNumber,
      eq.barcode,
      eq.capacity || "",
      eq.ownerName || "",
      eq.businessName || "",
      eq.city || "",
      eq.district || "",
      eq.province || "",
      STATUS_MAP[eq.status]?.label || eq.status,
      eq.lastTeraDate ? formatDate(new Date(eq.lastTeraDate)) : "",
      eq.teraExpiryDate ? formatDate(new Date(eq.teraExpiryDate)) : "",
      formatDate(new Date(eq.createdAt)),
    ]);


      const wsData = [headers, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Auto-fit column widths
      const colWidths = headers.map((h, i) => {
        const maxLen = Math.max(h.length, ...rows.map((r) => String(r[i]).length));
        return { wch: Math.min(maxLen + 2, 40) };
      });
      ws["!cols"] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Laporan UTTP");

      const fileName = `Laporan_UTTP_${orgName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Laporan Detail Alat
          </CardTitle>
          {filteredData.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={exporting}>
              {exporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {exporting ? "Mengekspor..." : "Export Excel"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Status</SelectItem>
                <SelectItem value="ACTIVE">Aktif</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
                <SelectItem value="PENDING">Bersyarat</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Jenis Alat</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Jenis</SelectItem>
                {filterOptions.types.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Kota</label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Kota</SelectItem>
                {filterOptions.cities.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Pencarian</label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nama, barcode, pemilik..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Tgl Daftar Dari</label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Tgl Daftar Sampai</label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Kadaluarsa Dari</label>
            <Input type="date" value={expiryFrom} onChange={(e) => setExpiryFrom(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Kadaluarsa Sampai</label>
            <Input type="date" value={expiryTo} onChange={(e) => setExpiryTo(e.target.value)} />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSearch} disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Cari
          </Button>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
        </div>

        {/* Results Table */}
        {hasSearched && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">
              Menampilkan {filteredData.length} dari {data.length} alat
            </p>
            <div className="border rounded-lg overflow-auto max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">No</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Barcode</TableHead>
                    <TableHead>Pemilik</TableHead>
                    <TableHead>Kota</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Kadaluarsa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Tidak ada data ditemukan
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((eq, i) => {
                      const s = STATUS_MAP[eq.status] || STATUS_MAP.ACTIVE;
                      return (
                        <TableRow key={eq.id}>
                          <TableCell className="text-sm">{i + 1}</TableCell>
                          <TableCell className="font-medium text-sm">{eq.name}</TableCell>
                          <TableCell className="text-sm">{eq.type}</TableCell>
                          <TableCell className="font-mono text-xs">{eq.barcode}</TableCell>
                          <TableCell className="text-sm">{eq.ownerName || "-"}</TableCell>
                          <TableCell className="text-sm">{eq.city || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={s.variant}>{s.label}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {eq.teraExpiryDate ? formatDate(new Date(eq.teraExpiryDate)) : "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
