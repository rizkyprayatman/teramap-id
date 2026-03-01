import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto" />
        <p className="text-sm text-muted-foreground">Memuat data admin...</p>
      </div>
    </div>
  );
}
