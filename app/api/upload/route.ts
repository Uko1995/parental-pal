import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file received" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const filename = `service-${timestamp}.${fileExtension}`;
    const filepath = join(process.cwd(), "public/images/services", filename);

    // Write file to public/images/services directory
    await writeFile(filepath, buffer);

    return NextResponse.json({
      success: true,
      filename,
      url: `/images/services/${filename}`,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
