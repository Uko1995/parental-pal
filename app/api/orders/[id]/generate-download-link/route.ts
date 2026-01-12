import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import crypto from "crypto";

// Generate a download link for an order
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: orderId } = await context.params;

    const client = await clientPromise;
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

    // Verify ownership
    const orderUserId = order.userId?.toString();
    if (orderUserId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "You do not have access to this order" },
        { status: 403 }
      );
    }

    // Check payment status
    if (order.paymentStatus !== "paid") {
      return NextResponse.json(
        { success: false, error: "Payment not completed for this order" },
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

    // Generate download token
    const token = crypto
      .createHash("sha256")
      .update(
        `${orderId}-${order.customerEmail}-${process.env.NEXTAUTH_SECRET}`
      )
      .digest("hex")
      .substring(0, 32);

    // Generate download page URL
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const downloadPageUrl = `${baseUrl}/products/download?orderId=${orderId}&token=${token}`;

    return NextResponse.json({
      success: true,
      data: {
        downloadPageUrl,
        expiresIn: "30 days from purchase date",
      },
    });
  } catch (error) {
    console.error("Generate download link error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate download link" },
      { status: 500 }
    );
  }
}
