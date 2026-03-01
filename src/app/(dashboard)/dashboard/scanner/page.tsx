import dynamic from "next/dynamic";

const BarcodeScanner = dynamic(
  () => import("@/components/dashboard/barcode-scanner").then((m) => m.BarcodeScanner),
  { ssr: false, loading: () => <div className="h-64 rounded-lg animate-pulse bg-muted" /> }
);

export default function ScannerPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Scanner Barcode</h1>
        <p className="text-muted-foreground">
          Scan atau masukkan barcode untuk menemukan alat UTTP
        </p>
      </div>
      <BarcodeScanner />
    </div>
  );
}
