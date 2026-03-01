"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Wallet,
  LayoutTemplate,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  Menu,
  X,
  FileText,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-5 w-5" />,
  Building2: <Building2 className="h-5 w-5" />,
  Users: <Users className="h-5 w-5" />,
  CreditCard: <CreditCard className="h-5 w-5" />,
  Wallet: <Wallet className="h-5 w-5" />,
  LayoutTemplate: <LayoutTemplate className="h-5 w-5" />,
  FileText: <FileText className="h-5 w-5" />,
  BarChart3: <BarChart3 className="h-5 w-5" />,
  Settings: <Settings className="h-5 w-5" />,
};

const navItems = [
  { label: "Dashboard Global", href: "/admin", icon: "LayoutDashboard" },
  { label: "Organisasi", href: "/admin/organizations", icon: "Building2" },
  { label: "User Monitor", href: "/admin/users", icon: "Users" },
  { label: "Template Global", href: "/admin/templates", icon: "FileText" },
  { label: "Paket Langganan", href: "/admin/plans", icon: "LayoutTemplate" },
  { label: "Transaksi", href: "/admin/transactions", icon: "CreditCard" },
  { label: "Pengaturan", href: "/admin/settings", icon: "Settings" },
];

interface Props {
  userName: string;
}

export function AdminSidebar({ userName }: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-background border shadow-sm"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full bg-background border-r flex flex-col transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="p-4 flex items-center gap-2">
          <Shield className="h-7 w-7 text-red-500 shrink-0" />
          {!collapsed && (
            <div>
              <h2 className="font-bold text-sm">TERAMAP</h2>
              <p className="text-xs text-red-500 font-medium">Super Admin</p>
            </div>
          )}
        </div>

        <Separator />

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-red-500/10 text-red-600 font-medium"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {iconMap[item.icon]}
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <Separator />

        {/* User */}
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-red-100 text-red-600">
                SA
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userName}</p>
                <p className="text-xs text-red-500">Super Admin</p>
              </div>
            )}
          </div>
          <form action={logoutAction}>
            <Button variant="ghost" size="sm" type="submit" className="w-full justify-start gap-2 text-muted-foreground">
              <LogOut className="h-4 w-4" />
              {!collapsed && "Logout"}
            </Button>
          </form>
        </div>

        {/* Collapse Toggle (desktop) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex items-center justify-center p-2 border-t hover:bg-muted"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </aside>
    </>
  );
}
