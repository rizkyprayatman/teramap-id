"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Loader2 } from "lucide-react";
import { generateDocumentData, getTemplateByType } from "@/actions/document";
import {
  CertificatePDF,
  EquipmentReportPDF,
  HtmlTemplatePDF,
  generatePDFBlob,
  downloadPDF,
  generateVerifyQRCode,
} from "@/lib/pdf-templates";
import { toast } from "sonner";

interface Equipment {
  id: string;
  name: string;
  type: string;
  brand: string | null;
  model: string | null;
  serialNumber: string;
  barcode: string;
  capacity: string | null;
  divisionValue: string | null;
  status: string;
  address: string | null;
  teraExpiryDate: string | null;
  lastTeraDate: string | null;
}

interface Props {
  equipment: Equipment[];
  orgName: string;
  orgAddress: string | null;
  signatureName: string | null;
  signatureTitle: string | null;
}

export function DocumentGenerator({ equipment, orgName, orgAddress, signatureName, signatureTitle }: Props) {
  const [selectedEquipmentId, setSelectedEquipmentId] = useState("");
  const [docType, setDocType] = useState("CERTIFICATE");
  const [isLoading, setIsLoading] = useState(false);

  const equipmentById = useMemo(() => {
    const map = new Map<string, Equipment>();
    for (const item of equipment) map.set(item.id, item);
    return map;
  }, [equipment]);

  const blobToDataUrl = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Failed to read blob"));
      reader.readAsDataURL(blob);
    });

  const fetchAsDataUrl = async (url: string): Promise<string | null> => {
    try {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) return null;
      const blob = await res.blob();
      return await blobToDataUrl(blob);
    } catch {
      return null;
    }
  };

  const applyPlaceholders = (html: string, replacements: Record<string, string>) => {
    let out = html;

    // 1) Allow placeholders inside image src attributes.
    for (const key of ["{{organization_logo}}", "{{qr_code}}", "{{barcode}}"] as const) {
      const value = replacements[key] || "";
      out = out.split(`src=\"${key}\"`).join(`src=\"${value}\"`);
      out = out.split(`src='${key}'`).join(`src='${value}'`);
    }

    // 2) Replace remaining occurrences.
    for (const [key, value] of Object.entries(replacements)) {
      out = out.split(key).join(value);
    }

    return out;
  };

  const applyImagePlaceholders = (html: string, images: { logoSrc?: string; qrSrc?: string; barcodeSrc?: string }) => {
    let out = html;

    const logoImg = images.logoSrc
      ? `<img src=\"${images.logoSrc}\" style=\"width:50px;height:50px;object-fit:contain;\" />`
      : "";
    const qrImg = images.qrSrc
      ? `<img src=\"${images.qrSrc}\" style=\"width:90px;height:90px;\" />`
      : "";
    const barcodeImg = images.barcodeSrc
      ? `<img src=\"${images.barcodeSrc}\" style=\"width:260px;height:70px;object-fit:contain;\" />`
      : "";

    // If placeholders are used as plain text, render them as images.
    out = out.split("{{organization_logo}}" ).join(logoImg);
    out = out.split("{{qr_code}}" ).join(qrImg);
    out = out.split("{{barcode}}" ).join(barcodeImg);

    return out;
  };

  const handleGenerate = async () => {
    if (isLoading) return;
    if (docType !== "REKAP" && !selectedEquipmentId) {
      toast.error("Pilih alat terlebih dahulu");
      return;
    }

    setIsLoading(true);
    try {
      if (docType === "REKAP") {
          // Generate full report PDF
          const blob = await generatePDFBlob(
            <EquipmentReportPDF
              data={{
                organization: { name: orgName, address: orgAddress },
                equipment: equipment.map((eq) => ({
                  name: eq.name,
                  type: eq.type,
                  serialNumber: eq.serialNumber,
                  barcode: eq.barcode,
                  status: eq.status,
                  teraExpiryDate: eq.teraExpiryDate,
                  lastTeraDate: eq.lastTeraDate,
                })),
                generatedAt: new Date().toISOString(),
              }}
            />
          );
          downloadPDF(blob, `Rekap_UTTP_${orgName}_${Date.now()}.pdf`);
          toast.success("PDF berhasil di-download!");
        } else {
          // Generate certificate for specific equipment
          const eq = equipmentById.get(selectedEquipmentId);
          if (!eq) {
            toast.error("Alat tidak ditemukan");
            return;
          }

          const docData = await generateDocumentData(eq.id, docType);
          if (!docData) {
            toast.error("Gagal mengambil data dokumen");
            return;
          }

          const template = await getTemplateByType(docType);
          const qrCodeDataUrl = await generateVerifyQRCode(eq.barcode);

          const org = docData.organization as any;

          const barcodeDataUrl = await fetchAsDataUrl(
            `/api/barcode?text=${encodeURIComponent(eq.barcode)}`
          );

          const logoDataUrl = org?.logoUrl ? await fetchAsDataUrl(String(org.logoUrl)) : null;

          const teraDate = docData.latestTera?.testDate
            ? new Date(docData.latestTera.testDate).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : new Date().toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });

          const expiryDate = eq.teraExpiryDate
            ? new Date(eq.teraExpiryDate).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : new Date().toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });
          const currentDate = new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });

          const replacements: Record<string, string> = {
            "{{organization_name}}": org?.name || orgName || "",
            "{{organization_logo}}": logoDataUrl || org?.logoUrl || "",
            "{{organization_address}}": org?.address || orgAddress || "",
            "{{organization_street}}": org?.street || "",
            "{{organization_village}}": org?.village || "",
            "{{organization_district}}": org?.district || "",
            "{{organization_city}}": org?.city || "",
            "{{organization_province}}": org?.province || "",
            "{{organization_postal_code}}": org?.postalCode || "",
            "{{equipment_name}}": eq.name || "",
            "{{equipment_type}}": eq.type || "",
            "{{serial_number}}": eq.serialNumber || "",
            "{{barcode_text}}": eq.barcode || "",
            "{{barcode}}": barcodeDataUrl || "",
            "{{tera_date}}": teraDate,
            "{{expiry_date}}": expiryDate,
            "{{location}}": eq.address || "",
            "{{officer_name}}": docData.latestTera?.officerName || "-",
            "{{result}}": docData.latestTera?.result || "PASS",
            "{{letter_number}}": docData.letterNumber || "DRAFT",
            "{{current_date}}": currentDate,
            "{{signature_name}}": signatureName || org?.signatureName || "",
            "{{signature_title}}": signatureTitle || org?.signatureTitle || "",
            "{{qr_code}}": qrCodeDataUrl,
          };

          const blob = await generatePDFBlob(
            template
              ? (
                  <HtmlTemplatePDF
                    data={{
                      headerHtml: applyPlaceholders(
                        applyImagePlaceholders(template.headerHtml, {
                          logoSrc: replacements["{{organization_logo}}"],
                          qrSrc: replacements["{{qr_code}}"],
                          barcodeSrc: replacements["{{barcode}}"],
                        }),
                        replacements
                      ),
                      bodyHtml: applyPlaceholders(
                        applyImagePlaceholders(template.bodyHtml, {
                          logoSrc: replacements["{{organization_logo}}"],
                          qrSrc: replacements["{{qr_code}}"],
                          barcodeSrc: replacements["{{barcode}}"],
                        }),
                        replacements
                      ),
                      footerHtml: applyPlaceholders(
                        applyImagePlaceholders(template.footerHtml, {
                          logoSrc: replacements["{{organization_logo}}"],
                          qrSrc: replacements["{{qr_code}}"],
                          barcodeSrc: replacements["{{barcode}}"],
                        }),
                        replacements
                      ),
                    }}
                  />
                )
              : (
                  <CertificatePDF
                    data={{
                      organization: {
                        name: orgName,
                        address: orgAddress,
                        signatureName,
                        signatureTitle,
                        logoUrl: logoDataUrl || org?.logoUrl || null,
                      },
                      equipment: {
                        name: eq.name,
                        type: eq.type,
                        brand: eq.brand,
                        model: eq.model,
                        serialNumber: eq.serialNumber,
                        barcode: eq.barcode,
                        capacity: eq.capacity,
                        divisionValue: eq.divisionValue,
                        address: eq.address,
                      },
                      tera: {
                        testDate: docData.latestTera?.testDate?.toString() || new Date().toISOString(),
                        result: docData.latestTera?.result || "PASS",
                        officerName: docData.latestTera?.officerName || "-",
                        notes: docData.latestTera?.notes || "",
                        expiryDate: eq.teraExpiryDate || new Date().toISOString(),
                      },
                      letterNumber: docData.letterNumber || "DRAFT",
                      qrCodeDataUrl,
                    }}
                  />
                )
          );
          downloadPDF(blob, `${docType}_${eq.barcode}_${Date.now()}.pdf`);
          toast.success("PDF berhasil di-download!");
        }
      } catch (err) {
        console.error("PDF generation error:", err);
        toast.error("Gagal generate PDF. Silakan coba lagi.");
      } finally {
        setIsLoading(false);
      }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Dokumen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Jenis Dokumen</Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CERTIFICATE">Sertifikat Tera</SelectItem>
                  <SelectItem value="RETERA_LETTER">Surat Keterangan Tera Ulang</SelectItem>
                  <SelectItem value="BERITA_ACARA">Berita Acara Pemeriksaan</SelectItem>
                  <SelectItem value="REKAP">Rekapitulasi Alat (Semua)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {docType !== "REKAP" && (
              <div className="space-y-2">
                <Label>Pilih Alat</Label>
                <Select value={selectedEquipmentId} onValueChange={setSelectedEquipmentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih alat..." />
                  </SelectTrigger>
                  <SelectContent>
                    {equipment.map((eq) => (
                      <SelectItem key={eq.id} value={eq.id}>
                        {eq.name} ({eq.barcode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading || (docType !== "REKAP" && !selectedEquipmentId)}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Generate & Download PDF
          </Button>
        </CardContent>
      </Card>

      {/* Equipment List for Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Alat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {equipment.length === 0 ? (
              <p className="text-muted-foreground text-sm">Belum ada alat terdaftar</p>
            ) : (
              equipment.slice(0, 10).map((eq) => (
                <div key={eq.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">{eq.name}</p>
                    <p className="text-xs text-muted-foreground">{eq.type} · {eq.barcode}</p>
                  </div>
                  <Badge
                    variant={
                      eq.status === "ACTIVE" ? "default" : eq.status === "EXPIRED" ? "destructive" : "secondary"
                    }
                  >
                    {eq.status === "ACTIVE" ? "Aktif" : eq.status === "EXPIRED" ? "Expired" : eq.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
