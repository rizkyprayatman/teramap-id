import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavigationProgress } from "@/components/navigation-progress";
import { Toaster } from "sonner";
import { prisma } from "@/lib/prisma";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const base: Metadata = {
    title: "TERAMAP - Platform Digital Manajemen UTTP & Tera",
    description:
      "Platform Digital Manajemen UTTP & Tera Berbasis Lokasi untuk Instansi & Pelaku Usaha. Kelola alat ukur, takar, timbang secara digital.",
    keywords: ["UTTP", "Tera", "Metrologi", "SaaS", "IoT", "Manajemen Alat"],
  };

  try {
    const settings = (await prisma.systemSetting.findFirst()) as unknown as {
      faviconUrl?: string | null;
    } | null;

    const faviconUrl = settings?.faviconUrl?.trim();
    if (faviconUrl) {
      base.icons = {
        icon: [{ url: faviconUrl }],
      };
    }
  } catch {
    // Ignore DB/Prisma failures (e.g. during build/prerender) and fall back to static metadata.
  }

  return base;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <NavigationProgress />
        <Toaster position="top-center" richColors closeButton />
        {children}
      </body>
    </html>
  );
}
