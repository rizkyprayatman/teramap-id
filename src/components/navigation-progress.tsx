"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export function NavigationProgress() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  useEffect(() => {
    // Intercept anchor clicks to show loading on navigation
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;
      if (anchor.hasAttribute("download")) return;
      if (
        href.startsWith("#") ||
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("blob:") ||
        href.startsWith("data:")
      ) {
        return;
      }
      if (anchor.target === "_blank") return;

      // Same page anchor
      if (href === pathname) return;

      setIsNavigating(true);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  if (!isNavigating) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-background/60 backdrop-blur-sm flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Memuat...</p>
      </div>
    </div>
  );
}
