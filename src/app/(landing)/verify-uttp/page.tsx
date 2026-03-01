"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, ShieldCheck, ShieldAlert, ShieldX, ArrowLeft, Loader2, Building2, Calendar, User, Store } from "lucide-react";

interface TeraHistory {
  testDate: string;
  result: "PASS" | "FAIL" | "CONDITIONAL";
  officerName: string;
}

interface Equipment {
  id: string;
  name: string;
  type: string;
  brand: string | null;
  model: string | null;
  serialNumber: string;
  capacity: string | null;
  divisionValue: string | null;
  status: string;
  barcode: string;
  lastTeraDate: string | null;
  teraExpiryDate: string | null;
  ownerName: string | null;
  businessName: string | null;
  organization: { name: string; type: string };
  teraHistories: TeraHistory[];
}

const RESULT_LABELS: Record<string, { label: string; color: string; icon: typeof ShieldCheck }> = {
  PASS: { label: "LULUS", color: "text-green-600 bg-green-50 border-green-200", icon: ShieldCheck },
  FAIL: { label: "TIDAK LULUS", color: "text-red-600 bg-red-50 border-red-200", icon: ShieldX },
  CONDITIONAL: { label: "BERSYARAT", color: "text-yellow-600 bg-yellow-50 border-yellow-200", icon: ShieldAlert },
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Aktif", color: "bg-green-100 text-green-800" },
  EXPIRED: { label: "Kedaluwarsa", color: "bg-red-100 text-red-800" },
  SUSPENDED: { label: "Ditangguhkan", color: "bg-yellow-100 text-yellow-800" },
  INACTIVE: { label: "Tidak Aktif", color: "bg-gray-100 text-gray-800" },
};

function VerifyUTTPContent() {
  const searchParams = useSearchParams();
  const didAutoSearchRef = useRef(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"all" | "barcode" | "owner" | "business">("all");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [isMultiple, setIsMultiple] = useState(false);

  const runSearch = useCallback(async (query: string, type: typeof searchType) => {
    const cleanedQuery = query.trim();
    if (!cleanedQuery) return;

    setLoading(true);
    setSearched(false);
    setEquipment(null);
    setEquipmentList([]);
    setIsMultiple(false);

    try {
      let url: string;
      if (type === "barcode") {
        url = `/api/verify?barcode=${encodeURIComponent(cleanedQuery)}`;
      } else {
        url = `/api/verify?query=${encodeURIComponent(cleanedQuery)}&type=${type}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setSearched(true);
      if (data.found) {
        if (data.multiple) {
          setIsMultiple(true);
          setEquipmentList(data.equipmentList);
        } else {
          setEquipment(data.equipment);
        }
      }
    } catch {
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-search when arriving from scanned QR (e.g. /verify-uttp?barcode=TERA-...)
  useEffect(() => {
    const barcode = searchParams.get("barcode");
    if (!barcode) return;
    if (didAutoSearchRef.current) return;
    didAutoSearchRef.current = true;

    setSearchType("barcode");
    setSearchQuery(barcode);
    void runSearch(barcode, "barcode");
  }, [searchParams, runSearch]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await runSearch(searchQuery, searchType);
  };

  const selectEquipment = (eq: Equipment) => {
    setEquipment(eq);
    setIsMultiple(false);
    setEquipmentList([]);
  };

  const formatDate = (d: string | null) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  const latestResult = equipment?.teraHistories?.[0];
  const resultInfo = latestResult ? RESULT_LABELS[latestResult.result] : null;
  const statusInfo = equipment ? STATUS_LABELS[equipment.status] || STATUS_LABELS.INACTIVE : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-primary">Verifikasi UTTP</h1>
            <p className="text-sm text-muted-foreground">Cek status tera alat ukur, takar, timbang, dan perlengkapannya</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Search */}
        <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <label className="block text-sm font-medium">Cari Alat UTTP</label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "Semua" },
              { value: "barcode", label: "Barcode" },
              { value: "owner", label: "Nama Pemilik" },
              { value: "business", label: "Nama Usaha" },
            ].map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setSearchType(t.value as typeof searchType)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                  searchType === t.value
                    ? "bg-primary text-white border-primary"
                    : "hover:bg-muted"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                searchType === "barcode" ? "Contoh: TERA-XXXX-XXXX" :
                searchType === "owner" ? "Masukkan nama pemilik..." :
                searchType === "business" ? "Masukkan nama usaha..." :
                "Cari berdasarkan barcode, pemilik, atau nama usaha..."
              }
              className="flex-1 px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Cari
            </button>
          </div>
        </form>

        {/* Result */}
        {searched && !equipment && !isMultiple && (
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <ShieldX className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h2 className="text-lg font-semibold">Alat Tidak Ditemukan</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Tidak ada alat terdaftar dengan pencarian &ldquo;{searchQuery}&rdquo;. Pastikan data yang dimasukkan benar.
            </p>
          </div>
        )}

        {/* Multiple Results */}
        {isMultiple && equipmentList.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 bg-muted/30 border-b">
              <h3 className="font-semibold">Ditemukan {equipmentList.length} Alat</h3>
              <p className="text-xs text-muted-foreground">Pilih alat untuk melihat detail</p>
            </div>
            <div className="divide-y">
              {equipmentList.map((eq) => {
                const st = STATUS_LABELS[eq.status] || STATUS_LABELS.INACTIVE;
                return (
                  <button
                    key={eq.id}
                    onClick={() => selectEquipment(eq)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">{eq.name}</p>
                      <p className="text-xs text-muted-foreground">{eq.type} &middot; {eq.barcode}</p>
                      {(eq.ownerName || eq.businessName) && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {eq.ownerName && <><User className="inline h-3 w-3 mr-1" />{eq.ownerName}</>}
                          {eq.ownerName && eq.businessName && " · "}
                          {eq.businessName && <><Store className="inline h-3 w-3 mr-1" />{eq.businessName}</>}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${st.color}`}>
                      {st.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {equipment && (
          <div className="space-y-4">
            {/* Status Banner */}
            {resultInfo && (
              <div className={`rounded-xl border p-6 flex items-center gap-4 ${resultInfo.color}`}>
                <resultInfo.icon className="h-10 w-10 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium opacity-80">Hasil Tera Terakhir</p>
                  <p className="text-2xl font-bold">{resultInfo.label}</p>
                  <p className="text-sm opacity-80">
                    Tanggal: {formatDate(latestResult!.testDate)} &middot; Petugas: {latestResult!.officerName}
                  </p>
                </div>
              </div>
            )}

            {/* Equipment Detail */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="px-6 py-4 bg-muted/30 border-b flex items-center justify-between">
                <h3 className="font-semibold">Informasi Alat</h3>
                {statusInfo && (
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                )}
              </div>
              <div className="p-6 grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <InfoRow label="Nama Alat" value={equipment.name} />
                <InfoRow label="Jenis" value={equipment.type} />
                <InfoRow label="Merek" value={equipment.brand} />
                <InfoRow label="Model" value={equipment.model} />
                <InfoRow label="Nomor Seri" value={equipment.serialNumber} />
                <InfoRow label="Kapasitas" value={equipment.capacity} />
                <InfoRow label="Barcode" value={equipment.barcode} />
                <InfoRow label="Nilai Skala" value={equipment.divisionValue} />
                <InfoRow label="Tera Terakhir" value={formatDate(equipment.lastTeraDate)} />
                <InfoRow label="Berlaku Sampai" value={formatDate(equipment.teraExpiryDate)} />
              </div>

              {/* Owner/Business Info */}
              {(equipment.ownerName || equipment.businessName) && (
                <div className="px-6 pb-6 pt-2 border-t">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Pemilik</h4>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    {equipment.ownerName && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" /> {equipment.ownerName}
                      </div>
                    )}
                    {equipment.businessName && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Store className="h-4 w-4" /> {equipment.businessName}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Organization */}
              <div className="px-6 py-3 bg-muted/20 border-t flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>Dikelola oleh: <strong className="text-foreground">{equipment.organization.name}</strong></span>
              </div>
            </div>

            {/* Tera History */}
            {equipment.teraHistories.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="px-6 py-4 bg-muted/30 border-b">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Riwayat Tera
                  </h3>
                </div>
                <div className="divide-y">
                  {equipment.teraHistories.map((h, i) => {
                    const ri = RESULT_LABELS[h.result];
                    return (
                      <div key={i} className="px-6 py-3 flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium">{formatDate(h.testDate)}</p>
                          <p className="text-xs text-muted-foreground">Petugas: {h.officerName}</p>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${ri?.color || ""}`}>
                          {ri?.label || h.result}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        {!searched && (
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 text-sm text-blue-800 space-y-2">
            <p className="font-semibold">Cara Verifikasi:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-700">
              <li>Temukan nomor barcode pada stiker alat UTTP Anda, atau siapkan nama pemilik/usaha</li>
              <li>Pilih jenis pencarian (Barcode, Nama Pemilik, atau Nama Usaha)</li>
              <li>Masukkan data pencarian pada kolom di atas</li>
              <li>Klik &quot;Cari&quot; untuk melihat status tera alat</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyUTTPPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <VerifyUTTPContent />
    </Suspense>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <span className="text-muted-foreground">{label}</span>
      <p className="font-medium">{value || "-"}</p>
    </div>
  );
}
