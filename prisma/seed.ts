import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type GlobalTemplateSpec = {
  name: string;
  type: string;
  headerHtml: string;
  bodyHtml: string;
  footerHtml: string;
};

const GLOBAL_DOCUMENT_TEMPLATES: GlobalTemplateSpec[] = [
  {
    name: "Global - Sertifikat Tera (Default)",
    type: "CERTIFICATE",
    headerHtml: String.raw`
<div>
  <table style="width:100%; border-bottom:1px solid #000; padding-bottom:8px;">
    <tr>
      <td style="width:70px; vertical-align:top;">{{organization_logo}}</td>
      <td style="text-align:center;">
        <div style="font-size:16px; font-weight:bold;">{{organization_name}}</div>
        <div style="font-size:10px; margin-top:2px;">
          {{organization_street}} {{organization_village}} {{organization_district}} {{organization_city}} {{organization_province}} {{organization_postal_code}}
        </div>
      </td>
      <td style="width:70px;"></td>
    </tr>
  </table>
</div>
`.trim(),
    bodyHtml: String.raw`
<div style="text-align:center; margin-top:12px;">
  <div style="font-size:14px; font-weight:bold;">SERTIFIKAT TERA</div>
  <div style="font-size:11px; margin-top:2px;">Nomor: {{letter_number}}</div>
</div>

<div style="margin-top:12px; font-size:11px;">
  <table style="width:100%; border:1px solid #000; border-collapse:collapse;">
    <tr>
      <td style="border:1px solid #000; padding:6px; width:35%;">Nama Alat</td>
      <td style="border:1px solid #000; padding:6px;">{{equipment_name}}</td>
    </tr>
    <tr>
      <td style="border:1px solid #000; padding:6px;">Jenis Alat</td>
      <td style="border:1px solid #000; padding:6px;">{{equipment_type}}</td>
    </tr>
    <tr>
      <td style="border:1px solid #000; padding:6px;">Nomor Seri</td>
      <td style="border:1px solid #000; padding:6px;">{{serial_number}}</td>
    </tr>
    <tr>
      <td style="border:1px solid #000; padding:6px;">Barcode</td>
      <td style="border:1px solid #000; padding:6px;">{{barcode_text}}</td>
    </tr>
    <tr>
      <td style="border:1px solid #000; padding:6px;">Lokasi</td>
      <td style="border:1px solid #000; padding:6px;">{{location}}</td>
    </tr>
    <tr>
      <td style="border:1px solid #000; padding:6px;">Tanggal Tera</td>
      <td style="border:1px solid #000; padding:6px;">{{tera_date}}</td>
    </tr>
    <tr>
      <td style="border:1px solid #000; padding:6px;">Berlaku s/d</td>
      <td style="border:1px solid #000; padding:6px;">{{expiry_date}}</td>
    </tr>
    <tr>
      <td style="border:1px solid #000; padding:6px;">Petugas</td>
      <td style="border:1px solid #000; padding:6px;">{{officer_name}}</td>
    </tr>
    <tr>
      <td style="border:1px solid #000; padding:6px;">Hasil</td>
      <td style="border:1px solid #000; padding:6px;">{{result}}</td>
    </tr>
  </table>
</div>

<div style="margin-top:12px; text-align:center;">
  {{barcode}}
</div>

<div style="margin-top:18px; font-size:11px;">
  <table style="width:100%;">
    <tr>
      <td style="width:60%; vertical-align:top;">
        <div>Ditandatangani pada: {{current_date}}</div>
        <div style="height:48px;"></div>
        <div style="font-weight:bold;">{{signature_name}}</div>
        <div>{{signature_title}}</div>
      </td>
      <td style="width:40%; text-align:center; vertical-align:top;">
        <div style="font-size:10px;">Scan untuk verifikasi</div>
        <div style="margin-top:6px;">{{qr_code}}</div>
      </td>
    </tr>
  </table>
</div>
`.trim(),
    footerHtml: String.raw`
<div style="border-top:1px solid #000; margin-top:10px; padding-top:6px; font-size:9px;">
  Dokumen ini diterbitkan secara elektronik oleh {{organization_name}}. Keaslian dokumen dapat diverifikasi melalui QR Code.
</div>
`.trim(),
  },
  {
    name: "Global - Surat Keterangan Tera Ulang (Default)",
    type: "RETERA_LETTER",
    headerHtml: String.raw`
<div>
  <table style="width:100%; border-bottom:1px solid #000; padding-bottom:8px;">
    <tr>
      <td style="width:70px; vertical-align:top;">{{organization_logo}}</td>
      <td style="text-align:center;">
        <div style="font-size:16px; font-weight:bold;">{{organization_name}}</div>
        <div style="font-size:10px; margin-top:2px;">
          {{organization_street}} {{organization_village}} {{organization_district}} {{organization_city}} {{organization_province}} {{organization_postal_code}}
        </div>
      </td>
      <td style="width:70px;"></td>
    </tr>
  </table>
</div>
`.trim(),
    bodyHtml: String.raw`
<div style="text-align:center; margin-top:12px;">
  <div style="font-size:14px; font-weight:bold;">SURAT KETERANGAN TERA ULANG</div>
  <div style="font-size:11px; margin-top:2px;">Nomor: {{letter_number}}</div>
</div>

<div style="margin-top:14px; font-size:11px; line-height:1.4;">
  <div>Yang bertanda tangan di bawah ini menerangkan bahwa:</div>
  <div style="margin-top:10px;">
    <table style="width:100%;">
      <tr><td style="width:30%;">Nama Alat</td><td style="width:5%;">:</td><td>{{equipment_name}}</td></tr>
      <tr><td>Jenis Alat</td><td>:</td><td>{{equipment_type}}</td></tr>
      <tr><td>Nomor Seri</td><td>:</td><td>{{serial_number}}</td></tr>
      <tr><td>Barcode</td><td>:</td><td>{{barcode_text}}</td></tr>
      <tr><td>Lokasi</td><td>:</td><td>{{location}}</td></tr>
    </table>
  </div>

  <div style="margin-top:10px;">Telah dilakukan tera pada tanggal <strong>{{tera_date}}</strong> dengan hasil <strong>{{result}}</strong> dan masa berlaku sampai <strong>{{expiry_date}}</strong>.</div>
  <div style="margin-top:10px;">Surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.</div>

  <div style="margin-top:14px; text-align:center;">{{barcode}}</div>

  <div style="margin-top:16px;">
    <table style="width:100%;">
      <tr>
        <td style="width:60%;"></td>
        <td style="width:40%; text-align:left;">
          <div>{{organization_city}}, {{current_date}}</div>
          <div style="height:44px;"></div>
          <div style="font-weight:bold;">{{signature_name}}</div>
          <div>{{signature_title}}</div>
        </td>
      </tr>
    </table>
  </div>
</div>
`.trim(),
    footerHtml: String.raw`
<div style="border-top:1px solid #000; margin-top:10px; padding-top:6px; font-size:9px;">
  Verifikasi: scan QR Code atau gunakan kode barcode {{barcode_text}} pada halaman verifikasi.
</div>
<div style="margin-top:6px; text-align:center;">{{qr_code}}</div>
`.trim(),
  },
  {
    name: "Global - Berita Acara Pemeriksaan (Default)",
    type: "BERITA_ACARA",
    headerHtml: String.raw`
<div>
  <table style="width:100%; border-bottom:1px solid #000; padding-bottom:8px;">
    <tr>
      <td style="width:70px; vertical-align:top;">{{organization_logo}}</td>
      <td style="text-align:center;">
        <div style="font-size:16px; font-weight:bold;">{{organization_name}}</div>
        <div style="font-size:10px; margin-top:2px;">
          {{organization_street}} {{organization_village}} {{organization_district}} {{organization_city}} {{organization_province}} {{organization_postal_code}}
        </div>
      </td>
      <td style="width:70px;"></td>
    </tr>
  </table>
</div>
`.trim(),
    bodyHtml: String.raw`
<div style="text-align:center; margin-top:12px;">
  <div style="font-size:14px; font-weight:bold;">BERITA ACARA PEMERIKSAAN</div>
  <div style="font-size:11px; margin-top:2px;">Nomor: {{letter_number}}</div>
</div>

<div style="margin-top:14px; font-size:11px; line-height:1.4;">
  <div>Pada hari ini tanggal <strong>{{current_date}}</strong>, telah dilakukan pemeriksaan/tera terhadap alat UTTP berikut:</div>

  <div style="margin-top:10px;">
    <table style="width:100%; border:1px solid #000; border-collapse:collapse;">
      <tr>
        <td style="border:1px solid #000; padding:6px; width:35%;">Nama Alat</td>
        <td style="border:1px solid #000; padding:6px;">{{equipment_name}}</td>
      </tr>
      <tr>
        <td style="border:1px solid #000; padding:6px;">Jenis Alat</td>
        <td style="border:1px solid #000; padding:6px;">{{equipment_type}}</td>
      </tr>
      <tr>
        <td style="border:1px solid #000; padding:6px;">Nomor Seri</td>
        <td style="border:1px solid #000; padding:6px;">{{serial_number}}</td>
      </tr>
      <tr>
        <td style="border:1px solid #000; padding:6px;">Barcode</td>
        <td style="border:1px solid #000; padding:6px;">{{barcode_text}}</td>
      </tr>
      <tr>
        <td style="border:1px solid #000; padding:6px;">Lokasi</td>
        <td style="border:1px solid #000; padding:6px;">{{location}}</td>
      </tr>
    </table>
  </div>

  <div style="margin-top:10px;">Tanggal pelaksanaan: <strong>{{tera_date}}</strong></div>
  <div>Petugas pemeriksa: <strong>{{officer_name}}</strong></div>
  <div>Hasil: <strong>{{result}}</strong></div>
  <div style="margin-top:10px;">Demikian berita acara ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.</div>

  <div style="margin-top:14px; text-align:center;">{{barcode}}</div>

  <div style="margin-top:16px;">
    <table style="width:100%;">
      <tr>
        <td style="width:60%;"></td>
        <td style="width:40%; text-align:left;">
          <div>{{organization_city}}, {{current_date}}</div>
          <div style="height:44px;"></div>
          <div style="font-weight:bold;">{{signature_name}}</div>
          <div>{{signature_title}}</div>
        </td>
      </tr>
    </table>
  </div>
</div>
`.trim(),
    footerHtml: String.raw`
<div style="border-top:1px solid #000; margin-top:10px; padding-top:6px; font-size:9px;">
  Verifikasi dokumen melalui QR Code berikut.
</div>
<div style="margin-top:6px; text-align:center;">{{qr_code}}</div>
`.trim(),
  },
  {
    name: "Global - Laporan Riwayat Tera (Default)",
    type: "HISTORY_REPORT",
    headerHtml: String.raw`
<div>
  <table style="width:100%; border-bottom:1px solid #000; padding-bottom:8px;">
    <tr>
      <td style="width:70px; vertical-align:top;">{{organization_logo}}</td>
      <td style="text-align:center;">
        <div style="font-size:16px; font-weight:bold;">{{organization_name}}</div>
        <div style="font-size:10px; margin-top:2px;">
          {{organization_street}} {{organization_village}} {{organization_district}} {{organization_city}} {{organization_province}} {{organization_postal_code}}
        </div>
      </td>
      <td style="width:70px;"></td>
    </tr>
  </table>
</div>
`.trim(),
    bodyHtml: String.raw`
<div style="text-align:center; margin-top:12px;">
  <div style="font-size:14px; font-weight:bold;">LAPORAN RIWAYAT TERA</div>
  <div style="font-size:11px; margin-top:2px;">Nomor: {{letter_number}}</div>
</div>

<div style="margin-top:14px; font-size:11px;">
  <div style="font-weight:bold; margin-bottom:6px;">Identitas Alat</div>
  <table style="width:100%; border:1px solid #000; border-collapse:collapse;">
    <tr>
      <td style="border:1px solid #000; padding:6px; width:35%;">Nama Alat</td>
      <td style="border:1px solid #000; padding:6px;">{{equipment_name}}</td>
    </tr>
    <tr>
      <td style="border:1px solid #000; padding:6px;">Jenis Alat</td>
      <td style="border:1px solid #000; padding:6px;">{{equipment_type}}</td>
    </tr>
    <tr>
      <td style="border:1px solid #000; padding:6px;">Nomor Seri</td>
      <td style="border:1px solid #000; padding:6px;">{{serial_number}}</td>
    </tr>
    <tr>
      <td style="border:1px solid #000; padding:6px;">Barcode</td>
      <td style="border:1px solid #000; padding:6px;">{{barcode_text}}</td>
    </tr>
  </table>

  <div style="font-weight:bold; margin-top:12px; margin-bottom:6px;">Ringkasan Tera Terakhir</div>
  <table style="width:100%; border:1px solid #000; border-collapse:collapse;">
    <tr>
      <td style="border:1px solid #000; padding:6px; width:35%;">Tanggal Tera</td>
      <td style="border:1px solid #000; padding:6px;">{{tera_date}}</td>
    </tr>
    <tr>
      <td style="border:1px solid #000; padding:6px;">Hasil</td>
      <td style="border:1px solid #000; padding:6px;">{{result}}</td>
    </tr>
    <tr>
      <td style="border:1px solid #000; padding:6px;">Petugas</td>
      <td style="border:1px solid #000; padding:6px;">{{officer_name}}</td>
    </tr>
    <tr>
      <td style="border:1px solid #000; padding:6px;">Berlaku s/d</td>
      <td style="border:1px solid #000; padding:6px;">{{expiry_date}}</td>
    </tr>
  </table>

  <div style="margin-top:12px; text-align:center;">{{barcode}}</div>
</div>
`.trim(),
    footerHtml: String.raw`
<div style="border-top:1px solid #000; margin-top:10px; padding-top:6px; font-size:9px;">
  Verifikasi data alat melalui QR Code berikut.
</div>
<div style="margin-top:6px; text-align:center;">{{qr_code}}</div>
`.trim(),
  },
  {
    name: "Global - Rekapitulasi Alat (Default)",
    type: "REKAP",
    headerHtml: String.raw`
<div>
  <table style="width:100%; border-bottom:1px solid #000; padding-bottom:8px;">
    <tr>
      <td style="width:70px; vertical-align:top;">{{organization_logo}}</td>
      <td style="text-align:center;">
        <div style="font-size:16px; font-weight:bold;">{{organization_name}}</div>
        <div style="font-size:10px; margin-top:2px;">Rekapitulasi Alat UTTP</div>
      </td>
      <td style="width:70px;"></td>
    </tr>
  </table>
</div>
`.trim(),
    bodyHtml: String.raw`
<div style="margin-top:12px; font-size:11px;">
  <div style="text-align:center; font-size:14px; font-weight:bold;">REKAPITULASI ALAT UTTP</div>
  <div style="text-align:center; font-size:11px; margin-top:2px;">Dicetak pada: {{current_date}}</div>

  <div style="margin-top:12px;">
    <div>Template ini disediakan sebagai default global. Untuk rekap, sistem akan menggunakan format rekap bawaan.</div>
  </div>
</div>
`.trim(),
    footerHtml: String.raw`
<div style="border-top:1px solid #000; margin-top:10px; padding-top:6px; font-size:9px;">
  {{organization_name}} - Rekapitulasi Alat UTTP
</div>
`.trim(),
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Create Super Admin from env vars
  const superAdminEmail = process.env.SEED_SUPERADMIN_EMAIL;
  const superAdminPassword = process.env.SEED_SUPERADMIN_PASSWORD;
  const superAdminName = process.env.SEED_SUPERADMIN_NAME;
  const superAdminRoleRaw = process.env.SEED_SUPERADMIN_ROLE;

  const superAdminRole: Role | null = (() => {
    if (!superAdminRoleRaw) return null;
    const allowed = Object.values(Role) as string[];
    if (!allowed.includes(superAdminRoleRaw)) return null;
    return superAdminRoleRaw as Role;
  })();

  if (
    !superAdminEmail ||
    !superAdminPassword ||
    !superAdminName ||
    !superAdminRole
  ) {
    console.log(
      "⚠️  Super Admin seed dilewati: set SEED_SUPERADMIN_EMAIL, SEED_SUPERADMIN_PASSWORD, SEED_SUPERADMIN_NAME, SEED_SUPERADMIN_ROLE",
    );
  } else {
    const existing = await prisma.user.findUnique({
      where: { email: superAdminEmail },
    });

    if (existing) {
      console.log("✅ Super Admin already exists:", superAdminEmail);
    } else {
      const hashedPassword = await bcrypt.hash(superAdminPassword, 12);
      const superAdmin = await prisma.user.create({
        data: {
          name: superAdminName,
          email: superAdminEmail,
          password: hashedPassword,
          role: superAdminRole,
          emailVerified: true,
          isActive: true,
        },
      });
      console.log("✅ Super Admin created:", superAdmin.email);
    }
  }

  // Create default SystemSetting if not exists
  const settingsCount = await prisma.systemSetting.count();
  if (settingsCount === 0) {
    await prisma.systemSetting.create({
      data: {
        subscriptionPrice: 100000,
        defaultTeraValidity: 365,
        maintenanceMode: false,
        enabledPaymentChannels: JSON.stringify([
          // Credit Card
          "VC",

          // Virtual Account
          "BC",
          "M2",
          "VA",
          "I1",
          "B1",
          "BT",
          "A1",
          "AG",
          "NC",
          "BR",
          "S1",
          "DM",
          "BV",

          // Ritel
          "FT",
          "IR",

          // E-Wallet
          "OV",
          "SA",
          "LF",
          "LA",
          "DA",
          "SL",
          "OL",

          // QRIS
          "SP",
          "NQ",
          "GQ",
          "SQ",

          // Kredit / Paylater
          "DN",
          "AT",

          // E-Banking
          "JP",

          // E-Commerce
          "T1",
          "T2",
          "T3",
        ]),
      },
    });
    console.log("✅ Default SystemSetting created");
  } else {
    console.log("✅ SystemSetting already exists");
  }

  // Create default Plans
  const planCount = await prisma.plan.count();
  if (planCount === 0) {
    await prisma.plan.createMany({
      data: [
        {
          name: "Free",
          slug: "free",
          monthlyPrice: 0,
          quarterlyPrice: 0,
          semiAnnualPrice: 0,
          annualPrice: 0,
          equipmentLimit: 10,
          userLimit: 2,
          description: "Untuk memulai digitalisasi alat UTTP",
          features: JSON.stringify([
            "Maks. 10 alat UTTP",
            "2 pengguna",
            "Barcode & scanner",
            "Peta lokasi dasar",
            "1 template dokumen",
          ]),
          isPopular: false,
          isActive: true,
          sortOrder: 0,
        },
        {
          name: "Pro",
          slug: "pro",
          monthlyPrice: 50000,
          quarterlyPrice: 135000,
          semiAnnualPrice: 250000,
          annualPrice: 450000,
          equipmentLimit: 999999,
          userLimit: 999999,
          description: "Fitur lengkap untuk pengelolaan UTTP profesional",
          features: JSON.stringify([
            "Alat UTTP unlimited",
            "Pengguna unlimited",
            "Barcode & scanner",
            "Peta lokasi lengkap",
            "Template dokumen unlimited",
            "Laporan & export Excel",
            "Sertifikat dengan QR Code",
            "Notifikasi email",
            "Dukungan prioritas",
          ]),
          isPopular: true,
          isActive: true,
          sortOrder: 1,
        },
      ],
    });
    console.log("✅ Default Plans created (Free + Pro)");
  } else {
    console.log("✅ Plans already exist");
  }

  // Seed Global Document Templates (Default)
  for (const tpl of GLOBAL_DOCUMENT_TEMPLATES) {
    const exists = await prisma.documentTemplate.findFirst({
      where: {
        type: tpl.type,
        isDefault: true,
        organizationId: null,
      },
    });

    if (exists) {
      console.log(`✅ Global template already exists: ${tpl.type}`);
      continue;
    }

    await prisma.documentTemplate.create({
      data: {
        ...tpl,
        isDefault: true,
        organizationId: null,
      },
    });
    console.log(`✅ Global template created: ${tpl.type}`);
  }

  console.log("🎉 Seeding completed!");
  if (superAdminEmail && superAdminPassword) {
    console.log("\n📋 Super Admin Credentials:");
    console.log("   Email:", superAdminEmail);
    console.log("   Password: [from SEED_SUPERADMIN_PASSWORD env]");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
