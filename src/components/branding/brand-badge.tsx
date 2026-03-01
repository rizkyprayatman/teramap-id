"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

type Branding = {
  logoUrl: string | null;
  faviconUrl: string | null;
};

let brandingCache: Branding | null = null;

async function fetchBrandingFresh(): Promise<Branding> {
  return fetch("/api/branding", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      const normalized: Branding = {
        logoUrl: (data?.logoUrl as string) || null,
        faviconUrl: (data?.faviconUrl as string) || null,
      };
      brandingCache = normalized;
      return normalized;
    })
    .catch(() => {
      const fallback: Branding = { logoUrl: null, faviconUrl: null };
      brandingCache = fallback;
      return fallback;
    });
}

export function BrandBadge(props: {
  containerClassName?: string;
  imgClassName?: string;
  iconClassName?: string;
  alt?: string;
}) {
  const { containerClassName, imgClassName, iconClassName, alt } = props;
  const [branding, setBranding] = useState<Branding | null>(brandingCache);

  useEffect(() => {
    let mounted = true;
    fetchBrandingFresh().then((b) => {
      if (mounted) setBranding(b);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const logoUrl = branding?.logoUrl;

  return (
    <div className={cn("flex items-center justify-center", containerClassName)}>
      {logoUrl ? (
        // Use <img> to support any URL without Next/Image domain restrictions.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt={alt || "Logo"}
          className={cn("h-6 w-6 object-contain", imgClassName)}
        />
      ) : (
        <MapPin className={cn("h-6 w-6", iconClassName)} />
      )}
    </div>
  );
}
