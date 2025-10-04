'use client';
import Image from "next/image";

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


  return (
    <Image
      src="/logo.png"
      width={width}
      height={height}
      alt={alt}
      className={className}
    />
  );
}
