# Cloudinary Images with Next.js - Complete Guide

This guide provides multiple solutions for working with Cloudinary images in your Next.js application.

## Solutions Available

### 1. CloudinaryImage Component (Recommended)

**Use when:** You want Next.js optimization with robust error handling
**File:** `/components/CloudinaryImage.tsx`

```tsx
import CloudinaryImage from "@/components/CloudinaryImage";

// Basic usage
<CloudinaryImage
  src="https://res.cloudinary.com/your-cloud/image/upload/v1234/sample.jpg"
  alt="User avatar"
  width={100}
  height={100}
  className="rounded-full"
/>

// With custom fallback
<CloudinaryImage
  src={imageUrl}
  alt="Profile"
  width={200}
  height={200}
  fallbackSrc="/custom-placeholder.png"
  priority={true}
/>
```

### 2. SimpleCloudinaryImage Component

**Use when:** Having issues with Next.js Image optimization
**File:** `/components/SimpleCloudinaryImage.tsx`

```tsx
import SimpleCloudinaryImage from "@/components/SimpleCloudinaryImage";

// Bypasses Next.js optimization entirely
<SimpleCloudinaryImage
  src={cloudinaryUrl}
  alt="Profile"
  width={100}
  height={100}
  className="rounded-full"
  name="John Doe" // For placeholder initials
/>;
```

### 3. Utility Functions

**File:** `/lib/cloudinary-utils.ts`

```tsx
import {
  optimizeCloudinaryUrl,
  generateAvatarPlaceholder,
  preloadCloudinaryImage,
} from "@/lib/cloudinary-utils";

// Manually optimize Cloudinary URLs
const optimizedUrl = optimizeCloudinaryUrl(originalUrl, 300, 300, 90);

// Generate placeholder with initials
const placeholder = generateAvatarPlaceholder("John Doe", 100);

// Preload images for better performance
preloadCloudinaryImage(imageUrl, 200, 200);
```

## Configuration Required

### 1. Next.js Configuration

Ensure your `next.config.ts` includes:

```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};
```

### 2. Environment Variables

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Cloudinary Upload Preset

Create an unsigned upload preset in your Cloudinary dashboard:

- Preset name: `tutor_profiles`
- Signing mode: `Unsigned`
- Folder: `tutor-profiles`
- Max file size: `5MB`
- Allowed formats: `jpg, jpeg, png, webp`

## Common Issues & Solutions

### Issue: Network timeout errors

**Solution:** Use `SimpleCloudinaryImage` or add `unoptimized={true}` to Next.js Image

### Issue: Images not loading in production

**Solution:** Verify `remotePatterns` in next.config.ts and environment variables

### Issue: Slow image loading

**Solution:** Use `preloadCloudinaryImage()` utility and `priority={true}` for above-the-fold images

### Issue: Images breaking layout

**Solution:** Always specify width and height, use object-fit CSS classes

## Dashboard Usage Examples

### Tutor Avatar in Table

```tsx
<CloudinaryImage
  src={tutor.userData?.user?.image}
  alt={tutor.userData?.user?.name || "Tutor"}
  width={40}
  height={40}
  className="rounded-full w-10 h-10"
/>
```

### Profile Picture Upload Preview

```tsx
{
  formData.userData.user.image && (
    <div className="relative w-32 h-32 rounded-full overflow-hidden">
      <CloudinaryImage
        src={formData.userData.user.image}
        alt="Profile preview"
        width={128}
        height={128}
        className="w-full h-full object-cover"
        priority={true}
      />
    </div>
  );
}
```

### Service Card Images

```tsx
<SimpleCloudinaryImage
  src={service.image}
  alt={service.title}
  width={300}
  height={200}
  className="w-full h-48 object-cover"
/>
```

## Performance Tips

1. **Use appropriate dimensions:** Don't load 2000px images for 100px displays
2. **Leverage Cloudinary transformations:** Automatic format, quality, and compression
3. **Preload critical images:** Use `priority={true}` for above-the-fold content
4. **Implement lazy loading:** Default behavior for images below the fold
5. **Use placeholders:** Better UX while images load

## Testing

Test your implementation with:

- Valid Cloudinary URLs
- Invalid/broken URLs
- Network interruptions
- Different device sizes
- Different connection speeds

This setup provides robust, production-ready image handling for your ParentalPal application.
