import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Get all orders for the current user
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Fetch user's orders - match by userId OR customerEmail
    const orders = await db
      .collection("orders")
      .find({
        $or: [
          { userId: session.user.id },
          { userId: new ObjectId(session.user.id) },
          { customerEmail: session.user.email },
        ],
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Fetch product details for each order
    const productIds = [...new Set(orders.map((o) => o.productId))];
    const products = await db
      .collection("products")
      .find({
        _id: { $in: productIds.map((id) => new ObjectId(id)) },
      })
      .toArray();

    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    // Map orders with product details
    const enrichedOrders = orders.map((order) => {
      const product = productMap.get(order.productId);
      return {
        _id: order._id.toString(),
        orderNumber:
          order.orderNumber || order._id.toString().slice(-8).toUpperCase(),
        productId: order.productId,
        productTitle: product?.title || order.productTitle || "Unknown Product",
        productSlug: product?.slug || "unknown",
        productThumbnail:
          product?.thumbnail ||
          product?.coverImage ||
          "/images/placeholder-book.png",
        author: product?.author || order.author || "Unknown Author",
        orderType: order.orderType,
        quantity: order.quantity || 1,
        unitPrice: order.unitPrice || order.totalAmount,
        totalAmount: order.totalAmount,
        discountAmount: order.discountAmount || 0,
        paymentStatus: order.payment?.status || order.status || "pending",
        orderStatus: order.status || "pending",
        downloadCount: order.download?.downloadCount || 0,
        downloadToken: order.download?.downloadToken || null,
        shippingAddress: order.shippingAddress,
        trackingNumber: order.trackingNumber,
        createdAt: order.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: enrichedOrders,
    });
  } catch (error) {
    console.error("Fetch orders error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
