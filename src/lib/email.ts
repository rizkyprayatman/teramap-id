import nodemailer from "nodemailer";

// ============================================================
// TERAMAP - Email Service
// ============================================================

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || "TERAMAP <noreply@teramap.id>";
const APP_URL = process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
export const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || process.env.ADMIN_EMAIL || "admin@teramap.id";

// ============================================================
// SEND EMAIL HELPER
// ============================================================

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    await transporter.sendMail({
      from: FROM,
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("[Email] Failed to send:", error);
    return { success: false, error };
  }
}

// ============================================================
// EMAIL TEMPLATES
// ============================================================

function baseTemplate(content: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:20px;">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);border-radius:12px 12px 0 0;padding:32px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:1px;">📍 TERAMAP</h1>
          <p style="margin:8px 0 0;color:#bfdbfe;font-size:13px;">Platform Digital Manajemen UTTP & Tera</p>
        </div>
        <!-- Content -->
        <div style="background:#ffffff;padding:32px;border-radius:0 0 12px 12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          ${content}
        </div>
        <!-- Footer -->
        <div style="text-align:center;padding:20px;color:#71717a;font-size:12px;">
          <p>&copy; ${new Date().getFullYear()} TERAMAP. All rights reserved.</p>
          <p>Platform Digital Manajemen UTTP & Tera Berbasis Lokasi</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ============================================================
// VERIFICATION EMAIL
// ============================================================

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
) {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  const html = baseTemplate(`
    <h2 style="margin:0 0 16px;color:#18181b;font-size:22px;">Verifikasi Email Anda</h2>
    <p style="color:#52525b;font-size:15px;line-height:1.6;">
      Halo <strong>${name}</strong>,
    </p>
    <p style="color:#52525b;font-size:15px;line-height:1.6;">
      Terima kasih telah mendaftar di TERAMAP! Silakan klik tombol di bawah untuk memverifikasi email Anda.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${verifyUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-weight:600;font-size:15px;">
        ✉️ Verifikasi Email
      </a>
    </div>
    <p style="color:#71717a;font-size:13px;line-height:1.5;">
      Atau salin link berikut ke browser:<br/>
      <a href="${verifyUrl}" style="color:#2563eb;word-break:break-all;">${verifyUrl}</a>
    </p>
    <p style="color:#71717a;font-size:13px;margin-top:16px;">
      Link ini berlaku selama <strong>24 jam</strong>. Jika Anda tidak mendaftar di TERAMAP, abaikan email ini.
    </p>
  `);

  return sendEmail({
    to: email,
    subject: "🔐 Verifikasi Email - TERAMAP",
    html,
  });
}

// ============================================================
// PASSWORD RESET EMAIL
// ============================================================

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${encodeURIComponent(token)}`;

  const html = baseTemplate(`
    <h2 style="margin:0 0 16px;color:#18181b;font-size:22px;">Reset Password</h2>
    <p style="color:#52525b;font-size:15px;line-height:1.6;">
      Halo <strong>${name}</strong>,
    </p>
    <p style="color:#52525b;font-size:15px;line-height:1.6;">
      Kami menerima permintaan untuk mereset password akun TERAMAP Anda. Klik tombol di bawah untuk membuat password baru.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-weight:600;font-size:15px;">
        🔑 Reset Password
      </a>
    </div>
    <p style="color:#71717a;font-size:13px;line-height:1.5;">
      Atau salin link berikut ke browser:<br/>
      <a href="${resetUrl}" style="color:#2563eb;word-break:break-all;">${resetUrl}</a>
    </p>
    <p style="color:#71717a;font-size:13px;margin-top:16px;">
      Link ini berlaku selama <strong>1 jam</strong>. Jika Anda tidak merasa meminta reset password, abaikan email ini.
    </p>
  `);

  return sendEmail({
    to: email,
    subject: "🔑 Reset Password - TERAMAP",
    html,
  });
}

// ============================================================
// GOVERNMENT REGISTRATION EMAIL (no verification link)
// ============================================================

export async function sendGovernmentRegistrationEmail(
  email: string,
  name: string,
  orgName: string
) {
  const html = baseTemplate(`
    <h2 style="margin:0 0 16px;color:#18181b;font-size:22px;">Pendaftaran Instansi Pemerintah</h2>
    <p style="color:#52525b;font-size:15px;line-height:1.6;">
      Halo <strong>${name}</strong>,
    </p>
    <p style="color:#52525b;font-size:15px;line-height:1.6;">
      Terima kasih telah mendaftarkan instansi <strong>${orgName}</strong> di platform TERAMAP.
    </p>
    <div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:8px;padding:20px;margin:20px 0;">
      <p style="margin:0 0 8px;color:#92400e;font-size:14px;font-weight:600;">⚠️ Verifikasi Instansi Pemerintah</p>
      <p style="margin:0;color:#92400e;font-size:14px;line-height:1.5;">
        Untuk organisasi pemerintah, diperlukan proses verifikasi manual. Silakan kirimkan <strong>Surat Kuasa</strong> atau dokumen pendukung resmi ke admin TERAMAP untuk proses aktivasi akun.
      </p>
    </div>
    <div style="background:#f0f9ff;border-left:4px solid #2563eb;padding:16px;border-radius:0 8px 8px 0;margin:20px 0;">
      <p style="margin:0;color:#1e40af;font-size:14px;font-weight:600;">Langkah selanjutnya:</p>
      <ol style="color:#1e40af;font-size:14px;padding-left:20px;margin:8px 0 0;">
        <li>Siapkan Surat Kuasa / SK resmi instansi</li>
        <li>Kirim dokumen ke email: <strong>${SUPPORT_EMAIL}</strong></li>
        <li>Tim kami akan memverifikasi dalam 1-3 hari kerja</li>
        <li>Anda akan menerima notifikasi setelah akun diaktifkan</li>
      </ol>
    </div>
    <p style="color:#71717a;font-size:13px;margin-top:16px;">
      Jika ada pertanyaan, hubungi tim support kami di <strong>${SUPPORT_EMAIL}</strong>
    </p>
  `);

  return sendEmail({
    to: email,
    subject: "🏛️ Pendaftaran Instansi Pemerintah - TERAMAP",
    html,
  });
}

// ============================================================
// ORGANIZATION APPROVAL EMAIL (after super admin approval)
// ============================================================

export async function sendOrganizationApprovedEmail(email: string, orgName: string) {
  const loginUrl = `${APP_URL}/login`;

  const html = baseTemplate(`
    <h2 style="margin:0 0 16px;color:#18181b;font-size:22px;">Akun Instansi Disetujui ✅</h2>
    <p style="color:#52525b;font-size:15px;line-height:1.6;">
      Pendaftaran instansi <strong>${orgName}</strong> telah <strong>disetujui</strong> dan akun Anda kini <strong>aktif</strong> di TERAMAP.
    </p>
    <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:16px;border-radius:0 8px 8px 0;margin:20px 0;">
      <p style="margin:0;color:#166534;font-size:14px;font-weight:600;">Anda sudah bisa login dan mulai menggunakan fitur:</p>
      <ul style="color:#166534;font-size:14px;padding-left:20px;margin:8px 0 0;">
        <li>Input alat UTTP</li>
        <li>Generate surat & sertifikat</li>
        <li>Kelola pengguna organisasi</li>
      </ul>
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a href="${loginUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-weight:600;font-size:15px;">
        🔐 Login ke TERAMAP
      </a>
    </div>
    <p style="color:#71717a;font-size:13px;margin-top:16px;">
      Butuh bantuan? Hubungi kami di <strong>${SUPPORT_EMAIL}</strong>
    </p>
  `);

  return sendEmail({
    to: email,
    subject: `✅ Akun Instansi Disetujui - ${orgName} | TERAMAP`,
    html,
  });
}

// ============================================================
// ORGANIZATION REJECTED EMAIL
// ============================================================

export async function sendOrganizationRejectedEmail(email: string, orgName: string, reason?: string) {
  const html = baseTemplate(`
    <h2 style="margin:0 0 16px;color:#18181b;font-size:22px;">Pendaftaran Instansi Ditolak ❌</h2>
    <p style="color:#52525b;font-size:15px;line-height:1.6;">
      Pendaftaran instansi <strong>${orgName}</strong> <strong>ditolak</strong>.
    </p>
    ${reason ? `
      <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:16px;border-radius:0 8px 8px 0;margin:20px 0;">
        <p style="margin:0;color:#991b1b;font-size:14px;font-weight:600;">Alasan penolakan:</p>
        <p style="margin:8px 0 0;color:#991b1b;font-size:14px;line-height:1.5;">${reason}</p>
      </div>
    ` : ""}
    <p style="color:#71717a;font-size:13px;margin-top:16px;">
      Jika Anda memerlukan klarifikasi atau ingin mengajukan ulang, hubungi tim support kami di <strong>${SUPPORT_EMAIL}</strong>
    </p>
  `);

  return sendEmail({
    to: email,
    subject: `❌ Pendaftaran Ditolak - ${orgName} | TERAMAP`,
    html,
  });
}

// ============================================================
// ORGANIZATION SUSPENDED EMAIL
// ============================================================

export async function sendOrganizationSuspendedEmail(email: string, orgName: string) {
  const html = baseTemplate(`
    <h2 style="margin:0 0 16px;color:#18181b;font-size:22px;">Akun Instansi Ditangguhkan ⚠️</h2>
    <p style="color:#52525b;font-size:15px;line-height:1.6;">
      Akun instansi <strong>${orgName}</strong> saat ini <strong>ditangguhkan</strong> sehingga akses ke dashboard dibatasi.
    </p>
    <div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:16px;border-radius:0 8px 8px 0;margin:20px 0;">
      <p style="margin:0;color:#92400e;font-size:14px;font-weight:600;">Apa yang bisa Anda lakukan?</p>
      <ul style="color:#92400e;font-size:14px;padding-left:20px;margin:8px 0 0;">
        <li>Hubungi tim support untuk klarifikasi</li>
        <li>Siapkan dokumen pendukung bila diperlukan</li>
      </ul>
    </div>
    <p style="color:#71717a;font-size:13px;margin-top:16px;">
      Support: <strong>${SUPPORT_EMAIL}</strong>
    </p>
  `);

  return sendEmail({
    to: email,
    subject: `⚠️ Akun Ditangguhkan - ${orgName} | TERAMAP`,
    html,
  });
}

// ============================================================
// ORGANIZATION UNSUSPENDED EMAIL
// ============================================================

export async function sendOrganizationUnsuspendedEmail(email: string, orgName: string) {
  const dashboardUrl = `${APP_URL}/dashboard`;

  const html = baseTemplate(`
    <h2 style="margin:0 0 16px;color:#18181b;font-size:22px;">Akun Instansi Diaktifkan Kembali ✅</h2>
    <p style="color:#52525b;font-size:15px;line-height:1.6;">
      Akun instansi <strong>${orgName}</strong> telah <strong>diaktifkan kembali</strong>. Anda sekarang dapat mengakses dashboard TERAMAP seperti biasa.
    </p>
    <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:16px;border-radius:0 8px 8px 0;margin:20px 0;">
      <p style="margin:0;color:#166534;font-size:14px;font-weight:600;">Langkah selanjutnya:</p>
      <ul style="color:#166534;font-size:14px;padding-left:20px;margin:8px 0 0;">
        <li>Login ke dashboard</li>
        <li>Periksa data alat UTTP & status tera</li>
        <li>Generate dokumen bila diperlukan</li>
      </ul>
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a href="${dashboardUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-weight:600;font-size:15px;">
        🚀 Buka Dashboard
      </a>
    </div>
    <p style="color:#71717a;font-size:13px;margin-top:16px;">
      Butuh bantuan? Hubungi kami di <strong>${SUPPORT_EMAIL}</strong>
    </p>
  `);

  return sendEmail({
    to: email,
    subject: `✅ Akun Diaktifkan Kembali - ${orgName} | TERAMAP`,
    html,
  });
}
// ============================================================
// WELCOME EMAIL (after verification)
// ============================================================

export async function sendWelcomeEmail(email: string, name: string, orgName: string) {
  const html = baseTemplate(`
    <h2 style="margin:0 0 16px;color:#18181b;font-size:22px;">Selamat Datang di TERAMAP! 🎉</h2>
    <p style="color:#52525b;font-size:15px;line-height:1.6;">
      Halo <strong>${name}</strong>,
    </p>
    <p style="color:#52525b;font-size:15px;line-height:1.6;">
      Email Anda telah berhasil diverifikasi. Organisasi <strong>${orgName}</strong> kini aktif di platform TERAMAP.
    </p>
    <div style="background:#f0f9ff;border-left:4px solid #2563eb;padding:16px;border-radius:0 8px 8px 0;margin:20px 0;">
      <p style="margin:0;color:#1e40af;font-size:14px;font-weight:600;">Langkah selanjutnya:</p>
      <ul style="color:#1e40af;font-size:14px;padding-left:20px;margin:8px 0 0;">
        <li>Tambahkan data alat UTTP pertama Anda</li>
        <li>Atur lokasi alat pada peta interaktif</li>
        <li>Undang anggota tim ke organisasi</li>
        <li>Kelola sertifikat tera secara digital</li>
      </ul>
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a href="${APP_URL}/dashboard" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-weight:600;font-size:15px;">
        🚀 Masuk Dashboard
      </a>
    </div>
  `);

  return sendEmail({
    to: email,
    subject: "🎉 Selamat Datang di TERAMAP!",
    html,
  });
}

// ============================================================
// USER INVITATION EMAIL
// ============================================================

export async function sendUserInvitationEmail(
  email: string,
  name: string,
  orgName: string,
  setupToken: string
) {
  const setupUrl = `${APP_URL}/setup-password?token=${setupToken}`;

  const html = baseTemplate(`
    <h2 style="margin:0 0 16px;color:#18181b;font-size:22px;">Undangan Bergabung</h2>
    <p style="color:#52525b;font-size:15px;line-height:1.6;">
      Halo <strong>${name}</strong>,
    </p>
    <p style="color:#52525b;font-size:15px;line-height:1.6;">
      Anda telah diundang untuk bergabung ke organisasi <strong>${orgName}</strong> di platform TERAMAP.
    </p>
    <p style="color:#52525b;font-size:15px;line-height:1.6;">
      Silakan klik tombol di bawah untuk mengatur password dan mengaktifkan akun Anda.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${setupUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-weight:600;font-size:15px;">
        🔑 Atur Password & Aktifkan Akun
      </a>
    </div>
    <p style="color:#71717a;font-size:13px;line-height:1.5;">
      Atau salin link berikut ke browser:<br/>
      <a href="${setupUrl}" style="color:#2563eb;word-break:break-all;">${setupUrl}</a>
    </p>
    <p style="color:#71717a;font-size:13px;">
      Link ini berlaku selama <strong>72 jam</strong>. Jika Anda tidak merasa diundang, abaikan email ini.
    </p>
  `);

  return sendEmail({
    to: email,
    subject: `📨 Undangan Bergabung ke ${orgName} - TERAMAP`,
    html,
  });
}

// ============================================================
// TERA EXPIRY REMINDER EMAIL
// ============================================================

export async function sendTeraExpiryReminderEmail(
  email: string,
  orgName: string,
  equipmentList: { name: string; type: string; expiryDate: string }[]
) {
  const rows = equipmentList
    .map(
      (eq) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e4e4e7;font-size:14px;">${eq.name}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e4e4e7;font-size:14px;">${eq.type}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e4e4e7;font-size:14px;color:#dc2626;font-weight:600;">${eq.expiryDate}</td>
      </tr>
    `
    )
    .join("");

  const html = baseTemplate(`
    <h2 style="margin:0 0 16px;color:#18181b;font-size:22px;">⚠️ Peringatan Tera Kedaluwarsa</h2>
    <p style="color:#52525b;font-size:15px;line-height:1.6;">
      Halo Tim <strong>${orgName}</strong>,
    </p>
    <p style="color:#52525b;font-size:15px;line-height:1.6;">
      Beberapa alat UTTP di organisasi Anda akan segera kedaluwarsa. Segera lakukan proses tera ulang.
    </p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;border:1px solid #e4e4e7;border-radius:8px;">
      <thead>
        <tr style="background:#f4f4f5;">
          <th style="padding:12px;text-align:left;font-size:13px;color:#52525b;border-bottom:2px solid #e4e4e7;">Nama Alat</th>
          <th style="padding:12px;text-align:left;font-size:13px;color:#52525b;border-bottom:2px solid #e4e4e7;">Jenis</th>
          <th style="padding:12px;text-align:left;font-size:13px;color:#52525b;border-bottom:2px solid #e4e4e7;">Tanggal Kadaluwarsa</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    <div style="text-align:center;margin:24px 0;">
      <a href="${APP_URL}/dashboard/equipment" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-weight:600;font-size:15px;">
        📋 Lihat Daftar Alat
      </a>
    </div>
  `);

  return sendEmail({
    to: email,
    subject: `⚠️ ${equipmentList.length} Alat UTTP Akan Kedaluwarsa - TERAMAP`,
    html,
  });
}

// ============================================================
// PAYMENT NOTIFICATION EMAIL
// ============================================================

export async function sendPaymentSuccessEmail(
  email: string,
  orgName: string,
  amount: string,
  orderId: string
) {
  const html = baseTemplate(`
    <h2 style="margin:0 0 16px;color:#18181b;font-size:22px;">✅ Pembayaran Berhasil</h2>
    <p style="color:#52525b;font-size:15px;line-height:1.6;">
      Halo Tim <strong>${orgName}</strong>,
    </p>
    <p style="color:#52525b;font-size:15px;line-height:1.6;">
      Pembayaran Anda telah berhasil diproses. Akun organisasi telah diupgrade ke <strong>Pro Plan</strong>.
    </p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:20px 0;">
      <table style="width:100%;">
        <tr>
          <td style="padding:4px 0;color:#52525b;font-size:14px;">Order ID</td>
          <td style="padding:4px 0;color:#18181b;font-size:14px;font-weight:600;text-align:right;">${orderId}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#52525b;font-size:14px;">Jumlah</td>
          <td style="padding:4px 0;color:#18181b;font-size:14px;font-weight:600;text-align:right;">${amount}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#52525b;font-size:14px;">Plan</td>
          <td style="padding:4px 0;color:#16a34a;font-size:14px;font-weight:600;text-align:right;">Pro Plan (30 hari)</td>
        </tr>
      </table>
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a href="${APP_URL}/dashboard/subscription" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-weight:600;font-size:15px;">
        📊 Lihat Subscription
      </a>
    </div>
  `);

  return sendEmail({
    to: email,
    subject: "✅ Pembayaran Berhasil - TERAMAP Pro",
    html,
  });
}

// ============================================================
// GENERIC NOTIFICATION EMAIL
// ============================================================

export async function sendNotificationEmail(
  email: string,
  name: string,
  title: string,
  message: string
) {
  const html = baseTemplate(`
    <h2 style="margin:0 0 16px;color:#18181b;font-size:22px;">${title}</h2>
    <p style="color:#52525b;font-size:15px;line-height:1.6;">
      Halo <strong>${name}</strong>,
    </p>
    <p style="color:#52525b;font-size:15px;line-height:1.6;">
      ${message}
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${APP_URL}/dashboard" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-weight:600;font-size:15px;">
        Buka Dashboard
      </a>
    </div>
  `);

  return sendEmail({
    to: email,
    subject: `${title} - TERAMAP`,
    html,
  });
}
