"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wrench,
  Map,
  ScanLine,
  FileText,
  FileCheck,
  LayoutTemplate,
  Users,
  CreditCard,
  Settings,
  Menu,
  X,
  LogOut,
  Building2,
  BarChart3,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth";
import { BrandBadge } from "@/components/branding/brand-badge";

const iconMap: Record<string, any> = {
  LayoutDashboard,
  Wrench,
  Map,
  ScanLine,
  FileText,
  FileCheck,
  LayoutTemplate,
  Users,
  CreditCard,
  Settings,
  Building2,
  BarChart3,
  Wallet,
};

// Roles that can see each nav item
const orgNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", roles: ["ORGANIZATION_OWNER", "ADMIN_INSTANSI", "STAFF", "VIEWER"] },
  { label: "Alat UTTP", href: "/dashboard/equipment", icon: "Wrench", roles: ["ORGANIZATION_OWNER", "ADMIN_INSTANSI", "STAFF", "VIEWER"] },
  { label: "Peta", href: "/dashboard/maps", icon: "Map", roles: ["ORGANIZATION_OWNER", "ADMIN_INSTANSI", "STAFF", "VIEWER"] },
  { label: "Scanner", href: "/dashboard/scanner", icon: "ScanLine", roles: ["ORGANIZATION_OWNER", "ADMIN_INSTANSI", "STAFF"] },
  { label: "Laporan", href: "/dashboard/reports", icon: "FileText", roles: ["ORGANIZATION_OWNER", "ADMIN_INSTANSI"] },
  { label: "Surat", href: "/dashboard/documents", icon: "FileCheck", roles: ["ORGANIZATION_OWNER", "ADMIN_INSTANSI"] },
  { label: "Template", href: "/dashboard/templates", icon: "LayoutTemplate", roles: ["ORGANIZATION_OWNER", "ADMIN_INSTANSI"] },
  { label: "Pengguna", href: "/dashboard/users", icon: "Users", roles: ["ORGANIZATION_OWNER"] },
  { label: "Subscription", href: "/dashboard/subscription", icon: "CreditCard", roles: ["ORGANIZATION_OWNER"] },
  { label: "Pengaturan", href: "/dashboard/settings", icon: "Settings", roles: ["ORGANIZATION_OWNER"] },
];

interface DashboardSidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
  organization?: {
    name: string;
  } | null;
}

export function DashboardSidebar({ user, organization }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Filter nav items based on user role
  const visibleNavItems = orgNavItems.filter(
    (item) => item.roles.includes(user.role)
  );

  return (
    <>
      {/* Mobile toggle - positioned to not overlap page title */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-3 right-3 z-50 md:hidden shadow-md"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-card border-r transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 p-4 border-b">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <BrandBadge iconClassName="h-5 w-5 text-white" imgClassName="h-6 w-6" />
            </div>
            <span className="text-lg font-bold">TERAMAP</span>
          </div>

          {/* Organization Info */}
          {organization && (
            <div className="p-4 border-b">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium truncate">{organization.name}</span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = iconMap[item.icon] || LayoutDashboard;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.role}</p>
              </div>
            </div>
            <form action={logoutAction}>
              <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" type="submit">
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </Button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
