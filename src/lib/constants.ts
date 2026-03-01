type Role = "SUPER_ADMIN" | "ORGANIZATION_OWNER" | "ADMIN_INSTANSI" | "STAFF" | "VIEWER";

// ============================================================
// TERAMAP - Constants
// ============================================================

export const APP_NAME = "TERAMAP";
export const APP_TAGLINE = "Platform Digital Manajemen UTTP & Tera Berbasis Lokasi untuk Instansi & Pelaku Usaha";
export const APP_DESCRIPTION = "Kelola alat Ukur, Takar, Timbang & Perlengkapannya (UTTP) secara digital dengan sistem tera berbasis lokasi, multi-tenant, dan terintegrasi.";

export const FREE_PLAN_MAX_EQUIPMENT = 10;
export const DEFAULT_SUBSCRIPTION_PRICE = 50000;
export const DEFAULT_TERA_VALIDITY_DAYS = 365;

export const ROLE_HIERARCHY: Record<Role, number> = {
  SUPER_ADMIN: 5,
  ORGANIZATION_OWNER: 4,
  ADMIN_INSTANSI: 3,
  STAFF: 2,
  VIEWER: 1,
};

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ORGANIZATION_OWNER: "Pemilik Organisasi",
  ADMIN_INSTANSI: "Admin Instansi",
  STAFF: "Staff",
  VIEWER: "Viewer",
};

export const ORGANIZATION_TYPE_LABELS = {
  GOVERNMENT: "Instansi Pemerintah",
  PRIVATE: "Lembaga Swasta",
  BUSINESS: "Unit Usaha",
  INDIVIDUAL: "Individu",
} as const;

export const EQUIPMENT_TYPES = [
  "Timbangan",
  "Meteran",
  "Takaran",
  "Pompa Ukur BBM",
  "Anak Timbangan",
  "Tangki Ukur",
  "Meter Air",
  "Meter Gas",
  "Meter Listrik (kWh)",
  "Alat Ukur Panjang",
  "Alat Ukur Volume",
  "Alat Ukur Tekanan",
  "Alat Ukur Suhu",
  "Lainnya",
] as const;

export const TERA_RESULT_LABELS = {
  PASS: "Lulus / Sah",
  FAIL: "Tidak Lulus / Batal",
  CONDITIONAL: "Bersyarat",
} as const;

export const DOCUMENT_TYPES = {
  CERTIFICATE: "Sertifikat Tera",
  RETERA_LETTER: "Surat Keterangan Tera Ulang",
  BERITA_ACARA: "Berita Acara Pemeriksaan",
  HISTORY_REPORT: "Laporan Riwayat Tera",
  REKAP: "Rekapitulasi Alat per Instansi",
} as const;

export const TEMPLATE_PLACEHOLDERS = [
  { key: "{{organization_name}}", label: "Nama Organisasi" },
  { key: "{{organization_logo}}", label: "Logo Organisasi (gambar)" },
  { key: "{{organization_address}}", label: "Alamat Organisasi" },
  { key: "{{organization_street}}", label: "Alamat (Jalan) Organisasi" },
  { key: "{{organization_village}}", label: "Desa/Kelurahan Organisasi" },
  { key: "{{organization_district}}", label: "Kecamatan Organisasi" },
  { key: "{{organization_city}}", label: "Kabupaten/Kota Organisasi" },
  { key: "{{organization_province}}", label: "Provinsi Organisasi" },
  { key: "{{organization_postal_code}}", label: "Kode Pos Organisasi" },
  { key: "{{equipment_name}}", label: "Nama Alat" },
  { key: "{{equipment_type}}", label: "Jenis Alat" },
  { key: "{{serial_number}}", label: "Nomor Seri" },
  { key: "{{barcode}}", label: "Barcode (gambar)" },
  { key: "{{barcode_text}}", label: "Barcode (teks)" },
  { key: "{{tera_date}}", label: "Tanggal Tera" },
  { key: "{{expiry_date}}", label: "Tanggal Kadaluarsa" },
  { key: "{{location}}", label: "Lokasi" },
  { key: "{{officer_name}}", label: "Nama Petugas" },
  { key: "{{result}}", label: "Hasil Tera" },
  { key: "{{letter_number}}", label: "Nomor Surat" },
  { key: "{{current_date}}", label: "Tanggal Sekarang" },
  { key: "{{signature_name}}", label: "Nama Penandatangan" },
  { key: "{{signature_title}}", label: "Jabatan Penandatangan" },
  { key: "{{qr_code}}", label: "QR Code Verifikasi (gambar)" },
] as const;

export const NAV_ITEMS_ORG = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Alat UTTP", href: "/dashboard/equipment", icon: "Wrench" },
  { label: "Peta", href: "/dashboard/maps", icon: "Map" },
  { label: "Scanner", href: "/dashboard/scanner", icon: "ScanLine" },
  { label: "Laporan", href: "/dashboard/reports", icon: "FileText" },
  { label: "Surat", href: "/dashboard/documents", icon: "FileCheck" },
  { label: "Template", href: "/dashboard/templates", icon: "LayoutTemplate" },
  { label: "Pengguna", href: "/dashboard/users", icon: "Users" },
  { label: "Subscription", href: "/dashboard/subscription", icon: "CreditCard" },
  { label: "Pengaturan", href: "/dashboard/settings", icon: "Settings" },
] as const;

export const NAV_ITEMS_ADMIN = [
  { label: "Dashboard Global", href: "/admin", icon: "LayoutDashboard" },
  { label: "Organisasi", href: "/admin/organizations", icon: "Building2" },
  { label: "User Monitor", href: "/admin/users", icon: "Users" },
  { label: "Subscription", href: "/admin/subscription", icon: "CreditCard" },
  { label: "Payment Channel", href: "/admin/payment", icon: "Wallet" },
  { label: "Template Default", href: "/admin/templates", icon: "LayoutTemplate" },
  { label: "Statistik", href: "/admin/statistics", icon: "BarChart3" },
  { label: "Pengaturan", href: "/admin/settings", icon: "Settings" },
] as const;
