"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Camera, Keyboard, Loader2, Search, Barcode as BarcodeIcon, QrCode } from "lucide-react";
import { getEquipmentByBarcode } from "@/actions/equipment";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface EquipmentResult {
  id: string;
  name: string;
  type: string;
  brand: string | null;
  serialNumber: string;
  barcode: string;
  status: string;
  teraExpiryDate: string | null;
  lastTeraDate: string | null;
  address: string | null;
  organization: { name: string };
  teraHistories: {
    id: string;
    testDate: string;
    result: string;
    officerName: string;
  }[];
}

export function BarcodeScanner() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [barcode, setBarcode] = useState("");
  const [result, setResult] = useState<EquipmentResult | null>(null);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<any>(null);

  const handleSearch = () => {
    if (!barcode.trim()) return;
    setError("");
    setResult(null);

    startTransition(async () => {
      const eq = await getEquipmentByBarcode(barcode.trim());
      if (eq) {
        setResult(JSON.parse(JSON.stringify(eq)));
      } else {
        setError("Alat tidak ditemukan dengan barcode: " + barcode);
      }
    });
  };

  const startCamera = async () => {
    try {
      setScanning(true);
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("barcode-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 280, height: 150 } },
        (decodedText) => {
          setBarcode(decodedText);
          stopCamera();
          // Auto-search
          setError("");
          setResult(null);
          startTransition(async () => {
            const eq = await getEquipmentByBarcode(decodedText);
            if (eq) {
              setResult(JSON.parse(JSON.stringify(eq)));
            } else {
              setError("Alat tidak ditemukan dengan barcode: " + decodedText);
            }
          });
        },
        () => {} // ignore error (no barcode found in frame)
      );
    } catch (err) {
      setError("Gagal mengakses kamera. Pastikan izin kamera sudah diberikan.");
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const statusMap: Record<string, { label: string; variant: "default" | "destructive" | "secondary" | "outline" }> = {
    ACTIVE: { label: "Aktif", variant: "default" },
    EXPIRED: { label: "Expired", variant: "destructive" },
    PENDING: { label: "Bersyarat", variant: "secondary" },
    SUSPENDED: { label: "Ditangguhkan", variant: "outline" },
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="manual" onClick={stopCamera}>
            <Keyboard className="mr-2 h-4 w-4" />
            Input Manual
          </TabsTrigger>
          <TabsTrigger value="camera">
            <Camera className="mr-2 h-4 w-4" />
            Scan Kamera
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarcodeIcon className="h-5 w-5" />
                Input Barcode Manual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Masukkan kode barcode..."
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="font-mono"
                />
                <Button onClick={handleSearch} disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="camera" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Scan via Kamera
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                id="barcode-reader"
                className="w-full max-w-md mx-auto rounded-lg overflow-hidden"
              />
              {!scanning ? (
                <Button onClick={startCamera} className="w-full max-w-md mx-auto block">
                  <Camera className="mr-2 h-4 w-4" />
                  Mulai Scan
                </Button>
              ) : (
                <Button onClick={stopCamera} variant="outline" className="w-full max-w-md mx-auto block">
                  Stop Scan
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Error */}
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{result.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{result.type}</p>
              </div>
              <Badge variant={statusMap[result.status]?.variant || "default"}>
                {statusMap[result.status]?.label || result.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Barcode</span>
                <span className="font-mono">{result.barcode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">No. Seri</span>
                <span className="font-mono">{result.serialNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Merek</span>
                <span>{result.brand || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Organisasi</span>
                <span>{result.organization.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tera Terakhir</span>
                <span>{result.lastTeraDate ? formatDate(new Date(result.lastTeraDate)) : "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kadaluarsa</span>
                <span>{result.teraExpiryDate ? formatDate(new Date(result.teraExpiryDate)) : "-"}</span>
              </div>
            </div>

            {result.teraHistories.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Riwayat Tera Terakhir</h4>
                <div className="space-y-2">
                  {result.teraHistories.slice(0, 3).map((h) => (
                    <div key={h.id} className="flex items-center justify-between p-2 rounded bg-muted/50 text-sm">
                      <span>{formatDate(new Date(h.testDate))}</span>
                      <Badge variant={h.result === "PASS" ? "default" : h.result === "FAIL" ? "destructive" : "secondary"}>
                        {h.result === "PASS" ? "Lulus" : h.result === "FAIL" ? "Tidak Lulus" : "Bersyarat"}
                      </Badge>
                      <span className="text-muted-foreground">{h.officerName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Link href={`/dashboard/equipment/${result.id}`}>
                <Button variant="outline" size="sm">Lihat Detail</Button>
              </Link>
              <Link href={`/dashboard/equipment/${result.id}/edit`}>
                <Button variant="outline" size="sm">Edit</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
