/**
 * Utility functions for handling Cloudinary images with Next.js
 */

/**
 * Transform Cloudinary URL to add optimizations
 * @param url - Original Cloudinary URL
 * @param width - Desired width
 * @param height - Desired height
 * @param quality - Image quality (1-100)
 * @returns Optimized Cloudinary URL
 */
export function optimizeCloudinaryUrl(
  url: string,
  width?: number,
  height?: number,
  quality: number = 80
): string {
  if (!url || !url.includes("res.cloudinary.com")) {
    return url;
  }

  // Extract parts of the Cloudinary URL
  const parts = url.split("/");
  const uploadIndex = parts.findIndex((part) => part === "upload");

  if (uploadIndex === -1) return url;

  // Build transformation string
  const transformations: string[] = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (quality !== 80) transformations.push(`q_${quality}`);

  // Add automatic format and quality optimizations
  transformations.push("f_auto", "c_fill");

  // Insert transformations after 'upload'
  if (transformations.length > 0) {
    parts.splice(uploadIndex + 1, 0, transformations.join(","));
  }

  return parts.join("/");
}

/**
 * Check if a URL is a valid Cloudinary URL
 * @param url - URL to check
 * @returns Boolean indicating if URL is from Cloudinary
 */
export function isCloudinaryUrl(url: string): boolean {
  return url?.includes("res.cloudinary.com") || false;
}

/**
 * Generate a placeholder image URL for avatars
 * @param name - User name for initials
 * @param size - Image size (default: 100)
 * @returns Base64 encoded SVG data URL
 */
export function generateAvatarPlaceholder(
  name?: string,
  size: number = 100
): string {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#e5e7eb"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
            font-family="Arial, sans-serif" font-size="${
              size * 0.4
            }" fill="#6b7280">
        ${initials}
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Preload Cloudinary image to avoid loading delays
 * @param url - Cloudinary image URL
 * @param width - Optional width for optimization
 * @param height - Optional height for optimization
 */
export function preloadCloudinaryImage(
  url: string,
  width?: number,
  height?: number
): void {
  if (typeof window === "undefined") return;

  const optimizedUrl = optimizeCloudinaryUrl(url, width, height);
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = optimizedUrl;
  document.head.appendChild(link);
}
