import { NextRequest, NextResponse } from "next/server";
import OrderRepository from "@/lib/OrderRepository";
import ProductRepository from "@/lib/ProductRepository";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET /api/products/download - Secure PDF download with token verification
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");
    const orderId = searchParams.get("orderId");

    if (!token || !orderId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get order by download token
    const order = await OrderRepository.getOrderByDownloadToken(token);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Invalid download token" },
        { status: 404 }
      );
    }

    // Verify order ID matches
    if (order._id?.toString() !== orderId) {
      return NextResponse.json(
        { success: false, error: "Order mismatch" },
        { status: 400 }
      );
    }

    // Check if order is paid
    if (order.payment.status !== "success" && order.status !== "paid") {
      return NextResponse.json(
        { success: false, error: "Order not paid" },
        { status: 403 }
      );
    }

    // Check if token expired
    if (order.download && new Date() > new Date(order.download.tokenExpiry)) {
      return NextResponse.json(
        { success: false, error: "Download link expired" },
        { status: 403 }
      );
    }

    // Check download limit
    if (
      order.download &&
      order.download.downloadCount >= order.download.maxDownloads
    ) {
      return NextResponse.json(
        { success: false, error: "Download limit reached" },
        { status: 403 }
      );
    }

    // Get product details
    const product = await ProductRepository.getProductById(order.productId);
    if (!product || !product.pdfFile) {
      return NextResponse.json(
        { success: false, error: "Product PDF not found" },
        { status: 404 }
      );
    }

    // Generate Cloudinary signed URL (expires in 2 hours)
    const timestamp = Math.round(new Date().getTime() / 1000);

    // Sanitize product title for filename
    const sanitizedTitle = product.title
      .replace(/[^a-zA-Z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .toLowerCase();

    const signedUrl = cloudinary.url(product.pdfFile.cloudinaryId, {
      resource_type: "raw",
      type: "authenticated", // Changed from "private" to match upload type
      sign_url: true,
      secure: true,
      expires_at: timestamp + 3600 * 2, // 2 hours expiry
      flags: "attachment",
      attachment: `${sanitizedTitle}.pdf`,
    });

    // Track download
    const clientIp =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    await OrderRepository.incrementDownloadCount(orderId, clientIp);

    // Redirect to the signed URL with proper filename
    const response = NextResponse.redirect(signedUrl);
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="${sanitizedTitle}.pdf"`
    );
    return response;
  } catch (error) {
    console.error("Error generating download:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate download link" },
      { status: 500 }
    );
  }
}
