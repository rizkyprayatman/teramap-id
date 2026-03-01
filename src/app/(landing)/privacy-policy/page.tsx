import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Kebijakan Privasi - TERAMAP",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
        </Link>

        <h1 className="text-3xl font-bold mb-2">Kebijakan Privasi</h1>
        <p className="text-sm text-muted-foreground mb-8">Terakhir diperbarui: Maret 2026</p>

        <div className="prose prose-sm max-w-none space-y-6">
          <Section title="1. Pendahuluan">
            <p>TERAMAP (&quot;Kami&quot;) menghargai privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda saat menggunakan platform TERAMAP.</p>
          </Section>

          <Section title="2. Informasi yang Kami Kumpulkan">
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Data Akun:</strong> Nama, email, nomor telepon, nama organisasi</li>
              <li><strong>Data Peralatan:</strong> Informasi alat UTTP, hasil tera, foto, lokasi GPS</li>
              <li><strong>Data Teknis:</strong> Alamat IP, jenis perangkat, log akses</li>
              <li><strong>Data Pembayaran:</strong> Riwayat transaksi (diproses oleh payment gateway pihak ketiga)</li>
            </ul>
          </Section>

          <Section title="3. Penggunaan Informasi">
            <p>Kami menggunakan informasi Anda untuk:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Menyediakan dan mengelola layanan TERAMAP</li>
              <li>Memproses peneraan dan sertifikasi alat UTTP</li>
              <li>Mengirim notifikasi terkait layanan</li>
              <li>Meningkatkan kualitas platform</li>
              <li>Memenuhi kewajiban hukum dan regulasi</li>
            </ul>
          </Section>

          <Section title="4. Berbagi Informasi">
            <p>Kami tidak menjual informasi pribadi Anda. Kami dapat membagikan data kepada:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Instansi pemerintah terkait metrologi legal (sesuai regulasi)</li>
              <li>Penyedia layanan pihak ketiga (hosting, payment gateway) dengan perjanjian kerahasiaan</li>
              <li>Pihak berwenang jika diwajibkan oleh hukum</li>
            </ul>
          </Section>

          <Section title="5. Keamanan Data">
            <p>Kami menerapkan langkah-langkah keamanan yang wajar termasuk enkripsi data, akses terbatas, dan monitoring berkala untuk melindungi informasi Anda dari akses yang tidak sah.</p>
          </Section>

          <Section title="6. Penyimpanan Data">
            <p>Data Anda disimpan selama akun aktif dan sesuai dengan kewajiban hukum yang berlaku. Anda dapat meminta penghapusan akun dan data terkait dengan menghubungi kami.</p>
          </Section>

          <Section title="7. Hak Pengguna">
            <p>Anda berhak untuk:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Mengakses dan memperbarui informasi pribadi Anda</li>
              <li>Meminta penghapusan data pribadi</li>
              <li>Membatasi pemrosesan data tertentu</li>
              <li>Mendapatkan salinan data Anda</li>
            </ul>
          </Section>

          <Section title="8. Cookie">
            <p>Kami menggunakan cookie yang diperlukan untuk fungsi autentikasi dan sesi pengguna. Tidak ada cookie pelacakan pihak ketiga yang digunakan.</p>
          </Section>

          <Section title="9. Perubahan Kebijakan">
            <p>Kami dapat memperbarui kebijakan ini sewaktu-waktu. Perubahan signifikan akan diberitahukan melalui email atau notifikasi di platform.</p>
          </Section>

          <Section title="10. Kontak">
            <p>Untuk pertanyaan mengenai kebijakan privasi ini, hubungi kami di:</p>
            <p className="font-medium">Email: support@teramap.id</p>
          </Section>

          <hr className="my-8" />

          {/* English Version */}
          <h2 className="text-2xl font-bold">Privacy Policy (English)</h2>
          <p className="text-sm text-muted-foreground">Last updated: Maret 2026</p>

          <Section title="1. Introduction">
            <p>TERAMAP (&quot;We&quot;) values your privacy. This Privacy Policy describes how we collect, use, and protect your personal information when using the TERAMAP platform.</p>
          </Section>

          <Section title="2. Information We Collect">
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Account Data:</strong> Name, email, phone number, organization name</li>
              <li><strong>Equipment Data:</strong> UTTP equipment information, calibration results, photos, GPS location</li>
              <li><strong>Technical Data:</strong> IP address, device type, access logs</li>
              <li><strong>Payment Data:</strong> Transaction history (processed by third-party payment gateway)</li>
            </ul>
          </Section>

          <Section title="3. Use of Information">
            <p>We use your information to provide and manage TERAMAP services, process equipment calibration and certification, send service-related notifications, improve platform quality, and comply with legal obligations.</p>
          </Section>

          <Section title="4. Data Sharing">
            <p>We do not sell your personal information. We may share data with relevant government agencies (as required by regulation), third-party service providers under confidentiality agreements, and authorities when required by law.</p>
          </Section>

          <Section title="5. Data Security">
            <p>We implement reasonable security measures including data encryption, restricted access, and regular monitoring to protect your information from unauthorized access.</p>
          </Section>

          <Section title="6. Your Rights">
            <p>You have the right to access, update, request deletion of, and obtain a copy of your personal data. Contact us to exercise these rights.</p>
          </Section>

          <Section title="7. Contact">
            <p>For questions about this Privacy Policy, contact us at:</p>
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
