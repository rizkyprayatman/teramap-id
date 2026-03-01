import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Syarat & Ketentuan - TERAMAP",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
        </Link>

        <h1 className="text-3xl font-bold mb-2">Syarat & Ketentuan</h1>
        <p className="text-sm text-muted-foreground mb-8">Terakhir diperbarui: Maret 2026</p>

        <div className="prose prose-sm max-w-none space-y-6">
          <Section title="1. Penerimaan Syarat">
            <p>Dengan mengakses dan menggunakan platform TERAMAP, Anda menyetujui syarat dan ketentuan ini. Jika Anda tidak setuju, harap berhenti menggunakan layanan kami.</p>
          </Section>

          <Section title="2. Deskripsi Layanan">
            <p>TERAMAP adalah platform SaaS (Software as a Service) untuk manajemen peneraan alat Ukur, Takar, Timbang, dan Perlengkapannya (UTTP). Layanan meliputi:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Pencatatan dan pelacakan alat UTTP</li>
              <li>Manajemen jadwal dan riwayat peneraan</li>
              <li>Pembuatan sertifikat dan dokumen resmi</li>
              <li>Peta lokasi dan verifikasi publik</li>
              <li>Pelaporan dan analisis data</li>
            </ul>
          </Section>

          <Section title="3. Pendaftaran Akun">
            <ul className="list-disc list-inside space-y-1">
              <li>Anda harus memberikan informasi yang akurat dan terkini saat mendaftar</li>
              <li>Anda bertanggung jawab menjaga kerahasiaan kredensial akun Anda</li>
              <li>Satu organisasi hanya dapat memiliki satu akun utama</li>
              <li>Anda harus berusia minimal 18 tahun untuk menggunakan layanan ini</li>
            </ul>
          </Section>

          <Section title="4. Paket Layanan">
            <p><strong>Free Plan:</strong> Tersedia gratis dengan batasan jumlah alat (10 alat), pengguna, dan fitur terbatas.</p>
            <p><strong>Pro Plan:</strong> Layanan berbayar per tahun dengan fitur lengkap, tanpa batasan alat, dan dukungan prioritas.</p>
            <p>Detail harga dan fitur tersedia di halaman utama platform.</p>
          </Section>

          <Section title="5. Pembayaran">
            <ul className="list-disc list-inside space-y-1">
              <li>Pembayaran Pro Plan diproses melalui payment gateway resmi</li>
              <li>Langganan berlaku selama 1 tahun sejak tanggal aktivasi</li>
              <li>Tidak ada pengembalian dana (refund) untuk periode yang telah berjalan</li>
              <li>Jika tidak diperpanjang, akun akan kembali ke Free Plan</li>
            </ul>
          </Section>

          <Section title="6. Penggunaan yang Diperbolehkan">
            <p>Anda setuju untuk:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Menggunakan platform sesuai dengan hukum dan regulasi yang berlaku</li>
              <li>Memasukkan data alat UTTP yang akurat dan dapat dipertanggungjawabkan</li>
              <li>Tidak menyalahgunakan platform untuk tujuan ilegal atau merugikan</li>
              <li>Tidak mencoba mengakses data organisasi lain tanpa izin</li>
            </ul>
          </Section>

          <Section title="7. Hak Kekayaan Intelektual">
            <p>Seluruh hak kekayaan intelektual atas platform TERAMAP, termasuk kode sumber, desain, merek, dan konten, adalah milik TERAMAP. Anda tidak diperkenankan menyalin, mendistribusikan, atau memodifikasi bagian apapun dari platform tanpa izin tertulis.</p>
          </Section>

          <Section title="8. Batasan Tanggung Jawab">
            <ul className="list-disc list-inside space-y-1">
              <li>Platform disediakan &quot;sebagaimana adanya&quot; tanpa jaminan apapun</li>
              <li>Kami tidak bertanggung jawab atas kerugian yang timbul akibat penggunaan platform</li>
              <li>Kami tidak bertanggung jawab atas gangguan layanan akibat force majeure</li>
              <li>Data yang dimasukkan pengguna adalah tanggung jawab pengguna</li>
            </ul>
          </Section>

          <Section title="9. Penghentian Layanan">
            <p>Kami berhak menangguhkan atau menghentikan akun Anda jika terjadi pelanggaran terhadap syarat dan ketentuan ini, tanpa pemberitahuan sebelumnya.</p>
          </Section>

          <Section title="10. Perubahan Syarat">
            <p>Kami dapat memperbarui syarat dan ketentuan ini sewaktu-waktu. Perubahan akan berlaku setelah dipublikasikan di platform.</p>
          </Section>

          <Section title="11. Hukum yang Berlaku">
            <p>Syarat dan ketentuan ini tunduk pada hukum Republik Indonesia. Segala sengketa diselesaikan melalui musyawarah atau melalui pengadilan yang berwenang di Indonesia.</p>
          </Section>

          <Section title="12. Kontak">
            <p>Untuk pertanyaan mengenai syarat dan ketentuan ini, hubungi kami di:</p>
            <p className="font-medium">Email: support@teramap.id</p>
          </Section>

          <hr className="my-8" />

          {/* English Version */}
          <h2 className="text-2xl font-bold">Terms & Conditions (English)</h2>
          <p className="text-sm text-muted-foreground">Last updated: Maret 2026</p>

          <Section title="1. Acceptance of Terms">
            <p>By accessing and using the TERAMAP platform, you agree to these terms and conditions. If you do not agree, please stop using our services.</p>
          </Section>

          <Section title="2. Service Description">
            <p>TERAMAP is a SaaS platform for managing calibration of measuring, weighing, and related equipment (UTTP). Services include equipment tracking, calibration management, certificate generation, location mapping, public verification, and data analytics.</p>
          </Section>

          <Section title="3. Account Registration">
            <p>You must provide accurate and current information. You are responsible for maintaining the confidentiality of your account credentials. One organization may only have one primary account. You must be at least 18 years old to use this service.</p>
          </Section>

          <Section title="4. Service Plans">
            <p><strong>Free Plan:</strong> Available free with limitations (10 equipment, limited users and features).</p>
            <p><strong>Pro Plan:</strong> Annual paid plan with full features, unlimited equipment, and priority support.</p>
          </Section>

          <Section title="5. Payment">
            <p>Pro Plan payments are processed through authorized payment gateways. Subscriptions are valid for 1 year from activation. No refunds for elapsed periods. Accounts revert to Free Plan if not renewed.</p>
          </Section>

          <Section title="6. Acceptable Use">
            <p>You agree to use the platform in compliance with applicable laws, enter accurate equipment data, not misuse the platform for illegal purposes, and not attempt to access other organizations&apos; data without authorization.</p>
          </Section>

          <Section title="7. Intellectual Property">
            <p>All intellectual property rights of the TERAMAP platform belong to TERAMAP. You may not copy, distribute, or modify any part of the platform without written permission.</p>
          </Section>

          <Section title="8. Limitation of Liability">
            <p>The platform is provided &quot;as is&quot; without warranties of any kind. We are not liable for damages arising from platform use, service interruptions due to force majeure, or user-entered data.</p>
          </Section>

          <Section title="9. Governing Law">
            <p>These terms are governed by the laws of the Republic of Indonesia. Disputes shall be resolved through deliberation or through competent courts in Indonesia.</p>
          </Section>

          <Section title="10. Contact">
            <p>For questions about these Terms & Conditions, contact us at:</p>
            <p className="font-medium">Email: support@teramap.id</p>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="text-muted-foreground leading-relaxed">{children}</div>
    </div>
  );
}
