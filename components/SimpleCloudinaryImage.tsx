"use client";

import { useState } from "react";
import {
  optimizeCloudinaryUrl,
  isCloudinaryUrl,
  generateAvatarPlaceholder,
} from "@/lib/cloudinary-utils";

interface SimpleCloudinaryImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  name?: string; // For generating placeholder initials
}

/**
 * Simple image component that bypasses Next.js optimization
 * Use this when you're having issues with Next.js Image component and Cloudinary
 */
export default function SimpleCloudinaryImage({
  src,
  alt,
  width = 100,
  height = 100,
  className = "",
  name,
}: SimpleCloudinaryImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Generate fallback URL
  const fallbackSrc = generateAvatarPlaceholder(name, Math.max(width, height));

  // Use optimized URL if it's from Cloudinary
  const imageSrc = hasError
    ? fallbackSrc
    : isCloudinaryUrl(src)
    ? optimizeCloudinaryUrl(src, width, height)
    : src;

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Loading indicator */}
      {isLoading && !hasError && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse rounded"
          style={{ width, height }}
        />
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${
          isLoading ? "opacity-0" : "opacity-100"
        } transition-opacity duration-200`}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
      />
    </div>
  );
}
