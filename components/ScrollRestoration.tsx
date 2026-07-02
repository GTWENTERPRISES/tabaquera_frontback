"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Simple scroll position cache
export const scrollPositions = new Map<string, number>();

export default function ScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    // Restore scroll position when pathname changes
    const savedPosition = scrollPositions.get(pathname);
    if (savedPosition !== undefined) {
      window.scrollTo(0, savedPosition);
    }
  }, [pathname]);

  return null;
}
