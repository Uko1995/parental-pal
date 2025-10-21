import { v2 as cloudinary } from "cloudinary";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Helper function to generate signed upload parameters
export const getSignedUploadParams = async (publicId?: string) => {
  const timestamp = Math.round(new Date().getTime() / 1000);

  const params = {
    timestamp,
    folder: "tutor-profiles",
    ...(publicId && { public_id: publicId }),
  };

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    ...params,
    signature,
    api_key: process.env.CLOUDINARY_API_KEY,
  };
};
