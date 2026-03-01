"use client";

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import Html from "react-pdf-html";

// ============================================================
// PDF Styles
// ============================================================
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.6,
  },
  headerSection: {
    textAlign: "center",
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    paddingBottom: 15,
  },
  orgName: {
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  orgAddress: {
    fontSize: 9,
    color: "#555",
    marginTop: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    textDecoration: "underline",
  },
  subtitle: {
    fontSize: 10,
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  labelCol: {
    width: "35%",
    fontSize: 10,
  },
  separatorCol: {
    width: "5%",
    fontSize: 10,
  },
  valueCol: {
    width: "60%",
    fontSize: 10,
    fontWeight: "bold",
  },
  section: {
    marginTop: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 4,
  },
  table: {
    width: "100%",
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#d1d5db",
  },
  tableCell: {
    padding: 6,
    fontSize: 9,
  },
  signatureSection: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  signatureBlock: {
    width: "40%",
    textAlign: "center",
  },
  signatureDate: {
    fontSize: 10,
    marginBottom: 50,
  },
  signatureName: {
    fontSize: 10,
    fontWeight: "bold",
    textDecoration: "underline",
  },
  signatureTitle: {
    fontSize: 9,
    color: "#555",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#999",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
  },
  badge: {
    backgroundColor: "#22c55e",
    color: "#fff",
    padding: "3 8",
    borderRadius: 4,
    fontSize: 9,
    fontWeight: "bold",
  },
  badgeFail: {
    backgroundColor: "#ef4444",
  },
  badgeConditional: {
    backgroundColor: "#eab308",
  },
});

// ============================================================
// Certificate PDF
// ============================================================
interface CertificateData {
  organization: {
    name: string;
    address?: string | null;
    logoUrl?: string | null;
    signatureName?: string | null;
    signatureTitle?: string | null;
  };
  equipment: {
    name: string;
    type: string;
    brand?: string | null;
    model?: string | null;
    serialNumber: string;
    barcode: string;
    capacity?: string | null;
    divisionValue?: string | null;
    address?: string | null;
  };
  tera: {
    testDate: string;
    result: string;
    officerName: string;
    notes?: string | null;
    expiryDate: string;
  };
  letterNumber: string;
  qrCodeDataUrl?: string | null;
}

export function CertificatePDF({ data }: { data: CertificateData }) {
  const resultLabel =
    data.tera.result === "PASS"
      ? "LULUS / SAH"
      : data.tera.result === "FAIL"
      ? "TIDAK LULUS / BATAL"
      : "BERSYARAT";

  const resultStyle =
    data.tera.result === "FAIL"
      ? [styles.badge, styles.badgeFail]
      : data.tera.result === "CONDITIONAL"
      ? [styles.badge, styles.badgeConditional]
      : styles.badge;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerSection}>
          <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 12 }}>
            {data.organization.logoUrl && (
              <Image src={data.organization.logoUrl} style={{ width: 50, height: 50, objectFit: "contain" }} />
            )}
            <View style={{ flex: 1, textAlign: "center" }}>
              <Text style={styles.orgName}>{data.organization.name}</Text>
              {data.organization.address && (
                <Text style={styles.orgAddress}>{data.organization.address}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>SERTIFIKAT TERA</Text>
        <Text style={styles.subtitle}>Nomor: {data.letterNumber}</Text>

        {/* Equipment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identitas Alat UTTP</Text>
          {[
            ["Nama Alat", data.equipment.name],
            ["Jenis", data.equipment.type],
            ["Merek / Model", `${data.equipment.brand || "-"} / ${data.equipment.model || "-"}`],
            ["Nomor Seri", data.equipment.serialNumber],
            ["Barcode", data.equipment.barcode],
            ["Kapasitas", data.equipment.capacity || "-"],
            ["Nilai Skala", data.equipment.divisionValue || "-"],
            ["Lokasi", data.equipment.address || "-"],
          ].map(([label, value], i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.labelCol}>{label}</Text>
              <Text style={styles.separatorCol}>:</Text>
              <Text style={styles.valueCol}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Tera Result */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hasil Pengujian</Text>
          {[
            ["Tanggal Tera", new Date(data.tera.testDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })],
            ["Hasil", resultLabel],
            ["Berlaku Sampai", new Date(data.tera.expiryDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })],
            ["Petugas Penguji", data.tera.officerName],
          ].map(([label, value], i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.labelCol}>{label}</Text>
              <Text style={styles.separatorCol}>:</Text>
              <Text style={styles.valueCol}>{value}</Text>
            </View>
          ))}
          {data.tera.notes && (
            <View style={styles.row}>
              <Text style={styles.labelCol}>Catatan</Text>
              <Text style={styles.separatorCol}>:</Text>
              <Text style={styles.valueCol}>{data.tera.notes}</Text>
            </View>
          )}
        </View>

        {/* Signature */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureDate}>
              {new Date().toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
            <Text style={styles.signatureName}>
              {data.organization.signatureName || "___________________"}
            </Text>
            <Text style={styles.signatureTitle}>
              {data.organization.signatureTitle || "Pejabat Berwenang"}
            </Text>
          </View>
        </View>

        {/* QR Code for verification */}
        {data.qrCodeDataUrl && (
          <View style={{ position: "absolute", bottom: 50, left: 40, alignItems: "center" }}>
            <Image src={data.qrCodeDataUrl} style={{ width: 70, height: 70 }} />
            <Text style={{ fontSize: 7, color: "#666", marginTop: 3 }}>Scan untuk verifikasi</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Dokumen ini digenerate oleh TERAMAP - Platform Digital Manajemen UTTP & Tera
        </Text>
      </Page>
    </Document>
  );
}

// ============================================================
// Report PDF (Rekap Equipment)
// ============================================================
interface ReportData {
  organization: { name: string; address?: string | null };
  equipment: {
    name: string;
    type: string;
    serialNumber: string;
    barcode: string;
    status: string;
    teraExpiryDate?: string | null;
    lastTeraDate?: string | null;
  }[];
  generatedAt: string;
}

export function EquipmentReportPDF({ data }: { data: ReportData }) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.orgName}>{data.organization.name}</Text>
          {data.organization.address && (
            <Text style={styles.orgAddress}>{data.organization.address}</Text>
          )}
        </View>

        <Text style={styles.title}>REKAPITULASI ALAT UTTP</Text>
        <Text style={styles.subtitle}>
          Digenerate: {new Date(data.generatedAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </Text>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, { width: "5%" }]}>No</Text>
            <Text style={[styles.tableCell, { width: "20%" }]}>Nama Alat</Text>
            <Text style={[styles.tableCell, { width: "15%" }]}>Jenis</Text>
            <Text style={[styles.tableCell, { width: "15%" }]}>No. Seri</Text>
            <Text style={[styles.tableCell, { width: "15%" }]}>Barcode</Text>
            <Text style={[styles.tableCell, { width: "10%" }]}>Status</Text>
            <Text style={[styles.tableCell, { width: "10%" }]}>Tera Terakhir</Text>
            <Text style={[styles.tableCell, { width: "10%" }]}>Kadaluarsa</Text>
          </View>
          {data.equipment.map((eq, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: "5%" }]}>{i + 1}</Text>
              <Text style={[styles.tableCell, { width: "20%" }]}>{eq.name}</Text>
              <Text style={[styles.tableCell, { width: "15%" }]}>{eq.type}</Text>
              <Text style={[styles.tableCell, { width: "15%" }]}>{eq.serialNumber}</Text>
              <Text style={[styles.tableCell, { width: "15%" }]}>{eq.barcode}</Text>
              <Text style={[styles.tableCell, { width: "10%" }]}>
                {eq.status === "ACTIVE" ? "Aktif" : eq.status === "EXPIRED" ? "Expired" : eq.status}
              </Text>
              <Text style={[styles.tableCell, { width: "10%" }]}>
                {eq.lastTeraDate ? new Date(eq.lastTeraDate).toLocaleDateString("id-ID") : "-"}
              </Text>
              <Text style={[styles.tableCell, { width: "10%" }]}>
                {eq.teraExpiryDate ? new Date(eq.teraExpiryDate).toLocaleDateString("id-ID") : "-"}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 10 }}>
            Total Alat: {data.equipment.length} | 
            Aktif: {data.equipment.filter(e => e.status === "ACTIVE").length} | 
            Expired: {data.equipment.filter(e => e.status === "EXPIRED").length}
          </Text>
        </View>

        <Text style={styles.footer}>
          Dokumen ini digenerate oleh TERAMAP - Platform Digital Manajemen UTTP & Tera
        </Text>
      </Page>
    </Document>
  );
}

// ============================================================
// HTML Template PDF (from Template Editor)
// ============================================================
interface HtmlTemplateData {
  headerHtml: string;
  bodyHtml: string;
  footerHtml: string;
}

export function HtmlTemplatePDF({ data }: { data: HtmlTemplateData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Html>{data.headerHtml}</Html>
        <Html>{data.bodyHtml}</Html>
        <Html>{data.footerHtml}</Html>
        <Text style={styles.footer}>
          Dokumen ini digenerate oleh TERAMAP - Platform Digital Manajemen UTTP & Tera
        </Text>
      </Page>
    </Document>
  );
}

// ============================================================
// PDF Generation Helper
// ============================================================
export async function generatePDFBlob(component: React.ReactElement): Promise<Blob> {
  return await pdf(component).toBlob();
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Generate QR code data URL for a barcode verification link
export async function generateVerifyQRCode(barcode: string): Promise<string> {
  const QRCode = await import("qrcode");
  const verifyUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/verify-uttp?barcode=${encodeURIComponent(barcode)}`;
  return QRCode.toDataURL(verifyUrl, { width: 200, margin: 1 });
}
