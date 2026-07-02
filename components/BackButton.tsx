"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { scrollPositions } from "./ScrollRestoration";

interface BackButtonProps {
  label?: string;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "destructive"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export default function BackButton({
  label = "Volver",
  variant = "ghost",
  size = "sm",
}: BackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  const handleBack = () => {
    // Save scroll position before navigating back
    scrollPositions.set(currentUrl, window.scrollY);
    router.back();
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleBack}
      className="gap-2 w-fit"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  );
}
