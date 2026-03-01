import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar userName={session.user.name || "Admin"} />
      <main className="flex-1 md:ml-64 p-6 pt-16 md:pt-6">{children}</main>
    </div>
  );
}
