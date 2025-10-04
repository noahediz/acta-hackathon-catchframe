'use client';

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type ThemedLogoProps = {
  width?: number;
  height?: number;
  alt?: string;
  className?: string;
};

export function ThemedLogo({
  width = 160,
  height = 100,
  alt = "Logo",
  className,
}: ThemedLogoProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // fallback logo (prevents hydration errors)
    return <Image src="/logo.png" width={width} height={height} alt={alt} className={className} />;
  }

  return (
    <Image
      src={theme === "dark" ? "/logo-white.png" : "/logo.png"}
      width={width}
      height={height}
      alt={alt}
      className={className}
    />
  );
}
