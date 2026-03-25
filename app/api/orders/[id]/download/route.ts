import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import crypto from "crypto";

// Validate download link and get download info
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await context.params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!orderId || !token) {
      return NextResponse.json(
        { success: false, error: "Invalid download link" },
        { status: 400 }
      );
    }

    const client = await clientPromise();
    const db = client.db();

    // Find order
    let order;
    try {
      order = await db.collection("orders").findOne({
        _id: new ObjectId(orderId),
      });
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid order ID" },
        { status: 400 }
      );
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Verify token
    const expectedToken = crypto
      .createHash("sha256")
      .update(
        `${orderId}-${order.customerEmail}-${process.env.NEXTAUTH_SECRET}`
      )
      .digest("hex")
      .substring(0, 32);

    if (token !== expectedToken) {
      return NextResponse.json(
        { success: false, error: "Invalid download token" },
        { status: 403 }
      );
    }

    // Check order status
    if (order.paymentStatus !== "paid") {
      return NextResponse.json(
        { success: false, error: "Payment not completed" },
        { status: 403 }
      );
    }

    // Check order type
    if (order.orderType !== "softcopy") {
      return NextResponse.json(
        { success: false, error: "This order is not a digital product" },
        { status: 400 }
      );
    }

    // Get product details
    const product = await db.collection("products").findOne({
      _id: new ObjectId(order.productId),
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Check download limits
    const maxDownloads = 5;
    const downloadCount = order.downloadCount || 0;
    const downloadExpiry = new Date(order.createdAt);
    downloadExpiry.setDate(downloadExpiry.getDate() + 30); // 30 days from purchase

    // Generate signed Cloudinary URL for download
    const pdfUrl = product.pdfUrl || product.softcopyFile;
    if (!pdfUrl) {
      return NextResponse.json(
        { success: false, error: "Download file not available" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: order._id.toString(),
        productTitle: product.title,
        downloadUrl: pdfUrl,
        expiresAt: downloadExpiry.toISOString(),
        downloadCount,
        maxDownloads,
      },
    });
  } catch (error) {
    console.error("Download validation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to validate download" },
      { status: 500 }
    );
  }
}

// Record a download
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await context.params;
    const body = await request.json();
    const { token } = body;

    if (!orderId || !token) {
      return NextResponse.json(
        { success: false, error: "Invalid request" },
        { status: 400 }
      );
    }

    const client = await clientPromise();
    const db = client.db();

    // Find and verify order
    let order;
    try {
      order = await db.collection("orders").findOne({
        _id: new ObjectId(orderId),
      });
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid order ID" },
        { status: 400 }
      );
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Verify token
    const expectedToken = crypto
      .createHash("sha256")
      .update(
        `${orderId}-${order.customerEmail}-${process.env.NEXTAUTH_SECRET}`
      )
      .digest("hex")
      .substring(0, 32);

    if (token !== expectedToken) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 403 }
      );
    }

    // Check download limits
    const maxDownloads = 5;
    const downloadCount = order.downloadCount || 0;

    if (downloadCount >= maxDownloads) {
      return NextResponse.json(
        { success: false, error: "Download limit reached" },
        { status: 403 }
      );
    }

    // Increment download count
    await db.collection("orders").updateOne(
      { _id: new ObjectId(orderId) },
      {
        $inc: { downloadCount: 1 },
        $push: {
          downloadHistory: {
            downloadedAt: new Date(),
            ip: request.headers.get("x-forwarded-for") || "unknown",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
        },
        $set: { updatedAt: new Date() },
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        downloadCount: downloadCount + 1,
        remainingDownloads: maxDownloads - downloadCount - 1,
      },
    });
  } catch (error) {
    console.error("Download record error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record download" },
      { status: 500 }
    );
  }
}
