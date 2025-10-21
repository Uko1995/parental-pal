# Cloudinary Setup Guide

## Steps to configure Cloudinary for image uploads:

1. **Create a Cloudinary Account**

   - Go to https://cloudinary.com
   - Sign up for a free account

2. **Get Your Credentials**

   - Go to your Cloudinary Dashboard
   - Copy your Cloud Name, API Key, and API Secret

3. **Update Environment Variables**

   - Replace the placeholder values in `.env.local`:

   ```bash
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
   CLOUDINARY_API_KEY=your_actual_api_key
   CLOUDINARY_API_SECRET=your_actual_api_secret
   ```

4. **Create Upload Preset**

   - In your Cloudinary dashboard, go to Settings → Upload
   - Click "Add upload preset"
   - Set preset name: `tutor_profiles`
   - Set signing mode to "Unsigned"
   - Set folder to `tutor-profiles`
   - Configure allowed formats: jpg, jpeg, png, webp
   - Set max file size: 5MB
   - Enable image transformations as needed

5. **Alternative: Local Storage**
   If you prefer local storage instead of Cloudinary, you can create a simple file upload API:
   - Create `/api/upload` endpoint
   - Save files to `public/uploads/tutors/`
   - Return the public URL path

## File Structure:

- `lib/cloudinary.ts` - Cloudinary configuration
- `app/tutors/PersonalInfoTab.tsx` - Contains the image upload component
- Environment variables in `.env.local`

## Features:

- ✅ Drag & drop image upload
- ✅ Image preview before saving
- ✅ File size and format validation
- ✅ Automatic image optimization via Cloudinary
- ✅ Remove/change image functionality
- ✅ Stores secure URL as string in database
