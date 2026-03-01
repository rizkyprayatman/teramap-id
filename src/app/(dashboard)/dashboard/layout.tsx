import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  let organization = null;
  if (session.user.organizationId) {
    organization = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
      select: { name: true, orgStatus: true, rejectionReason: true, isSuspended: true },
    });
  }

  // Block access for non-active organizations
  if (organization) {
    if (organization.orgStatus === "PENDING_APPROVAL") {
      return (
        <div className="flex items-center justify-center min-h-screen bg-muted/30">
          <div className="max-w-md text-center p-8 bg-white rounded-lg shadow-lg space-y-4">
            <div className="text-yellow-500 text-5xl">⏳</div>
            <h2 className="text-xl font-bold">Menunggu Persetujuan</h2>
            <p className="text-muted-foreground text-sm">
              Organisasi Anda sedang dalam proses verifikasi oleh admin. Anda akan diberitahu melalui email setelah disetujui.
            </p>
            <p className="text-xs text-muted-foreground">
              Proses verifikasi biasanya memakan waktu 1-3 hari kerja.
            </p>
          </div>
        </div>
      );
    }
    if (organization.orgStatus === "REJECTED") {
      return (
        <div className="flex items-center justify-center min-h-screen bg-muted/30">
          <div className="max-w-md text-center p-8 bg-white rounded-lg shadow-lg space-y-4">
            <div className="text-red-500 text-5xl">❌</div>
            <h2 className="text-xl font-bold text-red-700">Organisasi Ditolak</h2>
            <p className="text-muted-foreground text-sm">
              Pendaftaran organisasi Anda ditolak oleh admin.
            </p>
            {organization.rejectionReason && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                <strong>Alasan:</strong> {organization.rejectionReason}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Hubungi admin untuk informasi lebih lanjut.
            </p>
          </div>
        </div>
      );
    }
    if (organization.isSuspended) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-muted/30">
          <div className="max-w-md text-center p-8 bg-white rounded-lg shadow-lg space-y-4">
            <div className="text-red-500 text-5xl">🚫</div>
            <h2 className="text-xl font-bold text-red-700">Akun Disuspend</h2>
            <p className="text-muted-foreground text-sm">
              Organisasi Anda telah disuspend oleh admin. Hubungi admin untuk informasi lebih lanjut.
            </p>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="flex h-screen bg-muted/30">
      <DashboardSidebar
        user={{
          name: session.user.name || "",
          email: session.user.email || "",
          role: session.user.role,
        }}
        organization={organization}
      />
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
