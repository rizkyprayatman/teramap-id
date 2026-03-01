"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  MapPin,
  ScanLine,
  FileCheck,
  Shield,
  Building2,
  BarChart3,
  Wrench,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Globe,
  Zap,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Mail,
  Clock,
  Bell,
  Layers,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrandBadge } from "@/components/branding/brand-badge";

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-lg bg-white">
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="font-medium text-sm md:text-base">{question}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((data) => setPlans(data.plans || []))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-500/25">
              <BrandBadge
                iconClassName="h-5 w-5 text-white"
                imgClassName="h-6 w-6"
              />
            </div>
            <span className="text-xl font-bold tracking-tight">
              TERA<span className="text-primary">MAP</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#fitur" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Fitur
            </Link>
            <Link href="#solusi" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Solusi
            </Link>
            <Link href="#harga" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Harga
            </Link>
            <Link href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Masuk</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="shadow-lg shadow-primary/25">
                Daftar Gratis
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background px-4 py-4 space-y-3">
            <Link href="#fitur" className="block text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
              Fitur
            </Link>
            <Link href="#solusi" className="block text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
              Solusi
            </Link>
            <Link href="#harga" className="block text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
              Harga
            </Link>
            <Link href="#faq" className="block text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
              FAQ
            </Link>
            <div className="flex gap-3 pt-2 border-t">
              <Link href="/login" className="flex-1">
                <Button variant="outline" className="w-full" size="sm">Masuk</Button>
              </Link>
              <Link href="/register" className="flex-1">
                <Button className="w-full" size="sm">Daftar Gratis</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        <div className="container mx-auto px-4 py-20 md:py-28 lg:py-36 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-xs font-medium">
              <Zap className="h-3 w-3 mr-1.5" />
              Platform Digital Manajemen UTTP & Tera #1 di Indonesia
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
              Kelola Alat{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                UTTP & Tera
              </span>
              <br />
              Secara Digital
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Platform berbasis lokasi untuk instansi pemerintah & pelaku usaha.
              Manajemen alat ukur, takar, timbang & perlengkapannya dengan
              sistem tera digital terintegrasi.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 h-12 shadow-lg shadow-primary/25">
                  Mulai Gratis Sekarang
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#fitur">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 h-12">
                  Pelajari Lebih Lanjut
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Gratis 10 Alat</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Multi-Tenant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Berbasis Peta</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Tanpa Kartu Kredit</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            {[
              { value: "500+", label: "Alat Terkelola" },
              { value: "50+", label: "Organisasi" },
              { value: "99.9%", label: "Uptime" },
              { value: "24/7", label: "Notifikasi" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <Badge variant="destructive" className="mb-4">Tantangan</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Masalah yang Sering Terjadi
            </h2>
            <p className="text-muted-foreground text-lg">
              Pengelolaan alat UTTP masih manual di banyak instansi & bisnis
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                title: "Data Tidak Terpusat",
                desc: "Dokumen tera tersebar di banyak tempat, sulit dilacak dan diaudit saat dibutuhkan.",
                icon: Layers,
                color: "text-red-500",
                bg: "bg-red-50",
              },
              {
                title: "Expired Tidak Terdeteksi",
                desc: "Alat yang masa tera-nya habis sering tidak termonitor hingga ada masalah di lapangan.",
                icon: Clock,
                color: "text-orange-500",
                bg: "bg-orange-50",
              },
              {
                title: "Laporan Manual",
                desc: "Generate surat dan sertifikat masih manual, memakan waktu dan rawan kesalahan pengetikan.",
                icon: FileCheck,
                color: "text-yellow-600",
                bg: "bg-yellow-50",
              },
            ].map((item, i) => (
              <Card key={i} className="text-center border-red-100/50 hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className={`mx-auto h-14 w-14 rounded-2xl ${item.bg} flex items-center justify-center mb-2`}>
                    <item.icon className={`h-7 w-7 ${item.color}`} />
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solusi" className="py-20 md:py-28 bg-gradient-to-b from-blue-50/50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <Badge variant="secondary" className="mb-4">Solusi</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              TERAMAP Hadir sebagai Solusi Digital
            </h2>
            <p className="text-muted-foreground text-lg">
              Platform all-in-one untuk manajemen alat UTTP yang modern, aman, dan efisien
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-10 max-w-5xl mx-auto">
            {[
              {
                icon: Globe,
                title: "Multi-Tenant SaaS",
                desc: "Setiap organisasi memiliki ruang data terpisah. Aman, terisolasi, dan skalabel.",
              },
              {
                icon: MapPin,
                title: "Pemetaan Lokasi",
                desc: "Visualisasi lokasi alat pada peta interaktif dengan clustering otomatis dan filter.",
              },
              {
                icon: ScanLine,
                title: "Scan Barcode & QR",
                desc: "Pindai barcode alat via kamera untuk akses cepat data dan input hasil tera di lapangan.",
              },
              {
                icon: FileCheck,
                title: "Dokumen Otomatis",
                desc: "Generate sertifikat, surat, dan laporan secara otomatis dengan template kustom.",
              },
              {
                icon: Bell,
                title: "Notifikasi & Reminder",
                desc: "Notifikasi otomatis via email dan in-app saat masa tera alat akan kedaluwarsa.",
              },
              {
                icon: Shield,
                title: "Keamanan Data",
                desc: "Verifikasi email, session management, dan multi-role access control.",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-5 group">
                <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1.5">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="fitur" className="py-20 md:py-28 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <Badge variant="secondary" className="mb-4">Fitur Lengkap</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Semua yang Anda Butuhkan
            </h2>
            <p className="text-muted-foreground text-lg">
              Fitur komprehensif dalam satu platform terintegrasi
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Wrench, title: "Manajemen Alat UTTP", desc: "Kelola alat dengan data lengkap, barcode unik, dan tracking lokasi GPS" },
              { icon: MapPin, title: "Peta Interaktif", desc: "Peta berbasis Leaflet dengan marker clustering, popup info, dan filter status" },
              { icon: QrCode, title: "Scanner Barcode", desc: "Scan barcode & QR code via kamera perangkat untuk akses cepat info alat" },
              { icon: FileCheck, title: "Sertifikat & Surat", desc: "Generate dokumen resmi dengan QR Code verifikasi dan template kustom" },
              { icon: Shield, title: "Multi-Role Access", desc: "Level role access yang fleksibel dan aman untuk berbagai peran dalam organisasi" },
              { icon: Building2, title: "Multi-Organisasi", desc: "Mendukung organisasi pemerintah, swasta, bisnis, dan individu" },
              { icon: BarChart3, title: "Dashboard Analytics", desc: "Statistik dan monitoring alat dengan grafik informatif real-time" },
              { icon: CreditCard, title: "Pembayaran Online", desc: "Upgrade ke Pro Plan dengan berbagai metode pembayaran digital" },
            ].map((feature, i) => (
              <Card key={i} className="text-center group hover:shadow-lg hover:border-primary/20 transition-all duration-300 bg-white">
                <CardHeader>
                  <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 group-hover:bg-primary/15 flex items-center justify-center mb-3 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Government Ready */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <Badge variant="secondary" className="mb-4">Government Ready</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Siap untuk Instansi Pemerintah
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                TERAMAP dirancang sesuai kebutuhan instansi pemerintah untuk pengelolaan metrologi legal yang modern dan akuntabel.
              </p>
              <ul className="space-y-4">
                {[
                  "Format surat resmi sesuai standar pemerintah",
                  "Kop surat dan tanda tangan digital per instansi",
                  "Penomoran surat otomatis",
                  "QR Code verifikasi keaslian dokumen",
                  "Audit trail lengkap untuk setiap perubahan",
                  "Notifikasi email masa berlaku tera",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border shadow-inner">
              <div className="bg-white rounded-xl shadow-xl p-6 space-y-4 border">
                <div className="flex items-center gap-3 border-b pb-4">
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">PEMERINTAH KOTA CONTOH</div>
                    <div className="text-xs text-muted-foreground">Dinas Perdagangan</div>
                  </div>
                </div>
                <div className="text-center space-y-1 py-2">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Sertifikat Tera</div>
                  <div className="text-sm font-bold text-primary">No: 0001/TERA/01/2026</div>
                </div>
                <div className="space-y-2.5 text-xs bg-muted/30 rounded-lg p-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Alat:</span>
                    <span className="font-medium">Timbangan Digital</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">No. Seri:</span>
                    <span className="font-medium">TBG-2026-001</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Berlaku s/d:</span>
                    <span className="font-medium">31 Des 2026</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="success" className="text-[10px]">SAH ✓</Badge>
                  </div>
                </div>
                <div className="border-t pt-3 flex justify-between items-end">
                  <div className="text-[10px] text-muted-foreground">
                    <div>TTD Digital ✓</div>
                    <div className="text-[9px]">Terverifikasi</div>
                  </div>
                  <div className="h-10 w-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border">
                    <QrCode className="h-6 w-6 text-gray-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Maps Preview */}
      <section className="py-20 md:py-28 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <Badge variant="secondary" className="mb-4">Peta Interaktif</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pantau Lokasi Alat di Seluruh Wilayah
            </h2>
            <p className="text-muted-foreground text-lg">
              Visualisasi lokasi alat UTTP pada peta interaktif dengan filter status dan clustering
            </p>
          </div>
          <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden border shadow-xl bg-white">
            <div className="bg-gradient-to-br from-blue-50 via-sky-50 to-green-50 h-80 md:h-96 flex items-center justify-center relative">
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%232563eb' fill-opacity='0.3' fill-rule='evenodd'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/svg%3E\")"
              }} />
              {/* Simulated map markers */}
              <div className="absolute top-1/4 left-1/4 h-6 w-6 bg-blue-500 rounded-full shadow-lg animate-pulse opacity-60" />
              <div className="absolute top-1/3 right-1/3 h-8 w-8 bg-green-500 rounded-full shadow-lg animate-pulse opacity-60" />
              <div className="absolute bottom-1/3 left-1/2 h-5 w-5 bg-orange-500 rounded-full shadow-lg animate-pulse opacity-60" />
              <div className="absolute top-1/2 right-1/4 h-7 w-7 bg-blue-600 rounded-full shadow-lg animate-pulse opacity-60" />
              <div className="text-center z-10 relative">
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-white/80 shadow-xl mb-4 backdrop-blur-sm">
                  <MapPin className="h-10 w-10 text-primary" />
                </div>
                <p className="text-lg font-semibold text-primary">Peta Interaktif</p>
                <p className="text-sm text-muted-foreground mt-1">Marker clustering • Filter status • Popup detail alat</p>
              </div>
            </div>
            <div className="grid grid-cols-3 border-t divide-x">
              {[
                { icon: MapPin, label: "Lokasi GPS Alat" },
                { icon: Layers, label: "Layer Clustering" },
                { icon: ScanLine, label: "Scan & Locate" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-center gap-2 py-3 text-xs md:text-sm text-muted-foreground">
                  <item.icon className="h-4 w-4 text-primary" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="harga" className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <Badge variant="secondary" className="mb-4">Harga</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pilihan Paket yang Fleksibel
            </h2>
            <p className="text-muted-foreground text-lg">
              Mulai gratis, upgrade kapan saja sesuai kebutuhan organisasi Anda
            </p>
          </div>
          <div className={`grid gap-8 max-w-4xl mx-auto ${plans.length > 2 ? "md:grid-cols-3" : "md:grid-cols-2 max-w-3xl"}`}>
            {plans.length > 0 ? plans.map((plan) => {
              const features: string[] = Array.isArray(plan.features) ? plan.features : [];
              const isFree = plan.monthlyPrice === 0;
              return (
                <Card key={plan.id} className={`relative overflow-hidden ${plan.isPopular ? "border-primary/50 shadow-xl shadow-primary/10" : ""}`}>
                  {plan.isPopular && (
                    <>
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
                      <div className="absolute -top-0 right-4 translate-y-0">
                        <Badge className="px-4 rounded-t-none rounded-b-lg shadow-lg">Populer</Badge>
                      </div>
                    </>
                  )}
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-xl">{plan.name} Plan</CardTitle>
                    <div className="mt-4">
                      {isFree ? (
                        <>
                          <span className="text-4xl font-bold">Gratis</span>
                          <p className="text-sm text-muted-foreground mt-1">Selamanya</p>
                        </>
                      ) : (
                        <>
                          <span className="text-4xl font-bold">Rp {plan.monthlyPrice.toLocaleString("id-ID")}</span>
                          <span className="text-muted-foreground">/bulan</span>
                        </>
                      )}
                    </div>
                    {plan.description && (
                      <p className="text-xs text-muted-foreground mt-2">{plan.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      {features.map((item: string, i: number) => (
                        <li key={i} className="flex items-center gap-3">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/register" className="block mt-8">
                      {plan.isPopular ? (
                        <Button className="w-full h-11 shadow-lg shadow-primary/25">
                          Upgrade ke {plan.name}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full h-11">
                          {isFree ? "Mulai Gratis" : `Pilih ${plan.name}`}
                        </Button>
                      )}
                    </Link>
                  </CardContent>
                </Card>
              );
            }) : (
              /* Fallback hardcoded pricing when plans not loaded yet */
              <>
                <Card className="relative overflow-hidden">
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-xl">Free Plan</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">Gratis</span>
                      <p className="text-sm text-muted-foreground mt-1">Selamanya</p>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      {["Maks. 10 alat UTTP", "2 pengguna", "Barcode & scanner", "Peta lokasi dasar", "1 template dokumen"].map((item, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/register" className="block mt-8">
                      <Button variant="outline" className="w-full h-11">Mulai Gratis</Button>
                    </Link>
                  </CardContent>
                </Card>
                <Card className="relative border-primary/50 shadow-xl shadow-primary/10 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
                  <div className="absolute -top-0 right-4 translate-y-0">
                    <Badge className="px-4 rounded-t-none rounded-b-lg shadow-lg">Populer</Badge>
                  </div>
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-xl">Pro Plan</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">Rp 50.000</span>
                      <span className="text-muted-foreground">/bulan</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      {["Alat UTTP unlimited", "Pengguna unlimited", "Sertifikat dengan QR Code", "Template dokumen unlimited", "Laporan & export Excel", "Notifikasi email", "Dukungan prioritas"].map((item, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/register" className="block mt-8">
                      <Button className="w-full h-11 shadow-lg shadow-primary/25">
                        Upgrade ke Pro
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 md:py-28 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <Badge variant="secondary" className="mb-4">FAQ</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pertanyaan yang Sering Diajukan
            </h2>
          </div>
          <div className="max-w-2xl mx-auto space-y-3">
            <FAQItem
              question="Apa itu TERAMAP?"
              answer="TERAMAP adalah platform digital berbasis web untuk manajemen alat Ukur, Takar, Timbang, dan Perlengkapannya (UTTP) dengan fitur pemetaan lokasi, barcode scanning, dan generate dokumen otomatis."
            />
            <FAQItem
              question="Apakah bisa dipakai untuk instansi pemerintah?"
              answer="Ya, TERAMAP dirancang khusus untuk mendukung kebutuhan instansi pemerintah seperti Dinas Perdagangan & Metrologi Legal dengan fitur kop surat, TTD digital, nomor surat otomatis, dan QR Code verifikasi."
            />
            <FAQItem
              question="Berapa biaya menggunakan TERAMAP?"
              answer="TERAMAP menyediakan Free Plan (gratis selamanya) dengan kapasitas 10 alat, dan Pro Plan seharga Rp 50.000/bulan untuk unlimited alat dan fitur lengkap."
            />
            <FAQItem
              question="Apakah data saya aman?"
              answer="Ya, setiap organisasi memiliki data terpisah (multi-tenant), menggunakan enkripsi untuk data sensitif, dan mendukung verifikasi email serta role-based access control."
            />
            <FAQItem
              question="Bagaimana cara upgrade ke Pro Plan?"
              answer="Anda bisa upgrade langsung dari dashboard melalui pembayaran online yang terintegrasi dengan berbagai metode pembayaran seperti virtual account, e-wallet, dan transfer bank."
            />
            <FAQItem
              question="Apakah mendukung mobile / HP?"
              answer="Ya, TERAMAP sepenuhnya responsif dan bisa diakses dari browser HP. Fitur scan barcode juga menggunakan kamera HP secara langsung."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/20 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Siap Mendigitalkan
            <br className="hidden sm:block" />
            {" "}Pengelolaan UTTP?
          </h2>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Bergabung dengan ratusan instansi dan pelaku usaha yang sudah menggunakan TERAMAP untuk pengelolaan alat UTTP yang lebih efisien.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-base px-8 h-12 shadow-xl">
                Daftar Sekarang — Gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" className="text-base px-8 h-12 border-white/30 text-white hover:bg-white/10">
                Sudah Punya Akun? Masuk
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="py-14 border-t bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-500/25">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">
                  TERA<span className="text-primary">MAP</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground max-w-md leading-relaxed mb-6">
                Platform Digital Manajemen UTTP & Tera Berbasis Lokasi
                untuk Instansi & Pelaku Usaha. Kelola alat ukur, takar,
                timbang secara digital dengan mudah dan efisien.
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  <span>info@teramap.id</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><Link href="#fitur" className="hover:text-foreground transition-colors">Fitur</Link></li>
                <li><Link href="#harga" className="hover:text-foreground transition-colors">Harga</Link></li>
                <li><Link href="#faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
                <li><Link href="/verify-uttp" className="hover:text-foreground transition-colors">Verifikasi UTTP</Link></li>
                {/* <li><Link href="/login" className="hover:text-foreground transition-colors">Masuk</Link></li>
                <li><Link href="/register" className="hover:text-foreground transition-colors">Daftar</Link></li> */}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><Link href="/privacy-policy" className="hover:text-foreground transition-colors">Kebijakan Privasi</Link></li>
                <li><Link href="/terms-and-conditions" className="hover:text-foreground transition-colors">Syarat & Ketentuan</Link></li>
                <li><Link href="#footer" className="hover:text-foreground transition-colors">Kontak</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} TERAMAP. Hak Cipta Dilindungi.
            </p>
            <p className="text-xs text-muted-foreground">
              Dibuat dengan ❤️ untuk Indonesia
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
