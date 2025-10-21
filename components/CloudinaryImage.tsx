"use client";

import Image from "next/image";
import { useState } from "react";

interface CloudinaryImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  fallbackSrc?: string;
}

export default function CloudinaryImage({
  src,
  alt,
  width = 400,
  height = 400,
  className = "",
  priority = false,
  fill = false,
  sizes,
  fallbackSrc = "data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100' height='100' fill='%23e5e7eb'/%3e%3ccircle cx='50' cy='35' r='12' fill='%239ca3af'/%3e%3cpath d='M25 75c0-12 8-20 25-20s25 8 25 20' fill='%239ca3af'/%3e%3c/svg%3e",
}: CloudinaryImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Handle image load error
  const handleError = () => {
    console.log("Image failed to load:", imageSrc);
    setHasError(true);
    setIsLoading(false);
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
    }
  };

  // Handle successful image load
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  // If no valid src, return null to let parent handle the fallback
  if (!src || src.trim() === "") {
    return null;
  }

  // If the original src is not a valid Cloudinary URL and not a local image, use SimpleCloudinaryImage approach
  // const isValidCloudinaryUrl = src.includes("res.cloudinary.com");
  // const isLocalImage =
  //   src.startsWith("avatars.githubusercontent.com") || src.startsWith("data:");

  // if (!isValidCloudinaryUrl && !isLocalImage) {
  //   console.log("Invalid image URL:", src);
  //   return null;
  // }

  return (
    <div className={`relative ${className}`}>
      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
          <div className="loading loading-spinner loading-sm"></div>
        </div>
      )}

      {/* Image */}
      <Image
        src={imageSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={sizes}
        priority={priority}
        className={`${
          isLoading ? "opacity-0" : "opacity-100"
        } transition-opacity duration-200`}
        onLoad={handleLoad}
        onError={handleError}
        quality={90}
      />

      {/* Error overlay */}
      {hasError && imageSrc === fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
          <span className="text-gray-500 text-xs">Image not available</span>
        </div>
      )}
    </div>
  );
}
