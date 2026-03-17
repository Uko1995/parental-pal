import { v2 as cloudinary } from "cloudinary";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Folder constants for organization
export const CLOUDINARY_FOLDERS = {
  TUTOR_PROFILES: "tutor-profiles",
  TUTOR_DOCUMENTS: "tutor-documents",
  PRODUCT_THUMBNAILS: "product-thumbnails",
  PRODUCT_PDFS: "product-pdfs",
  SERVICES: "services",
};

// Helper function to generate signed upload parameters
export const getSignedUploadParams = async (
  publicId?: string,
  folder?: string
) => {
  const timestamp = Math.round(new Date().getTime() / 1000);

  const params = {
    timestamp,
    folder: folder || CLOUDINARY_FOLDERS.TUTOR_PROFILES,
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

// Upload file buffer to Cloudinary
export const uploadToCloudinary = async (
  buffer: Buffer,
  options: {
    folder: string;
    publicId?: string;
    resourceType?: "image" | "raw" | "auto";
    format?: string;
  }
): Promise<{ url: string; publicId: string; secureUrl: string }> => {
  return new Promise((resolve, reject) => {
    const uploadOptions: Record<string, unknown> = {
      folder: options.folder,
      resource_type: options.resourceType || "auto",
      ...(options.publicId && { public_id: options.publicId }),
      ...(options.format && { format: options.format }),
    };

    // For PDFs, set access type to authenticated for security
    if (
      options.resourceType === "raw" ||
      options.folder === CLOUDINARY_FOLDERS.PRODUCT_PDFS
    ) {
      uploadOptions.type = "authenticated";
      uploadOptions.resource_type = "raw";
    }

    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.url,
            secureUrl: result.secure_url,
            publicId: result.public_id,
          });
        } else {
          reject(new Error("Upload failed - no result"));
        }
      })
      .end(buffer);
  });
};

// Generate signed URL for private/authenticated files (like PDFs)
export const getSignedDownloadUrl = (
  publicId: string,
  expiresIn: number = 3600
): string => {
  return cloudinary.url(publicId, {
    type: "authenticated",
    resource_type: "raw",
    sign_url: true,
    expires_at: Math.floor(Date.now() / 1000) + expiresIn,
  });
};

// Delete file from Cloudinary
export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: "image" | "raw" = "image"
): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result.result === "ok";
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return false;
  }
};
