import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import OrderRepository from "@/lib/OrderRepository";
import ProductRepository from "@/lib/ProductRepository";
import { sendEmail, emailTemplates } from "@/lib/email-service";
import { CACHE_TAGS } from "@/lib/cache-config";
import { createPayment, findPaymentByReference } from "@/lib/PaymentRepository";
import { ObjectId } from "mongodb";

// GET /api/orders/verify-payment - Verify Paystack payment
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reference = searchParams.get("reference");
    const orderId = searchParams.get("orderId");

    if (!reference || !orderId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get order
    const order = await OrderRepository.getOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Check if already verified
    if (order.payment.status === "success") {
      return NextResponse.json({
        success: true,
        order: {
          ...order,
          _id: order._id?.toString(),
          productId: order.productId.toString(),
        },
        message: "Order already verified",
      });
    }

    // Verify payment with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackData.status || paystackData.data.status !== "success") {
      // Update order to failed
      await OrderRepository.updatePaymentStatus(orderId, {
        status: "failed",
        gatewayResponse: paystackData.message || "Payment failed",
        paystackResponse: paystackData,
      });

      return NextResponse.json(
        { success: false, error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Payment successful - update order
    await OrderRepository.updatePaymentStatus(orderId, {
      status: "success",
      paidAt: new Date(),
      method: paystackData.data.channel,
      gatewayResponse: "Payment successful",
      paystackResponse: paystackData,
    });

    // Update order status
    await OrderRepository.updateOrderStatus(orderId, "paid");

    // Save payment to payments collection
    const existingPayment = await findPaymentByReference(reference);
    if (!existingPayment) {
      await createPayment({
        bookingId: new ObjectId(orderId),
        userId: order.userId || new ObjectId(),
        amount: paystackData.data.amount / 100, // Convert from kobo to naira
        currency: paystackData.data.currency,
        status: "success",
        reference: reference,
        channel: paystackData.data.channel,
        gatewayResponse: "Payment successful",
        paystackResponse: paystackData,
        idempotencyKey: `${reference}-${orderId}`,
      });
    }

    // Update product sales metrics
    await ProductRepository.updateSalesMetrics(
      order.productId,
      order.orderType,
      order.totalAmount,
      order.quantity
    );

    // Get updated order
    const updatedOrder = await OrderRepository.getOrderById(orderId);

    // Send confirmation email
    await sendEmail({
      to: order.customerEmail,
      ...emailTemplates.productOrderConfirmation(order.customerName, {
        orderNumber: order.orderNumber,
        productTitle: order.productTitle,
        productThumbnail: order.productThumbnail,
        orderType: order.orderType,
        totalAmount: order.totalAmount,
        currency: order.currency,
        delivery: order.delivery,
      }),
    });

    // Mark confirmation email as sent
    await OrderRepository.updateEmailTracking(orderId, "confirmation");

    // For softcopy orders, send download link
    if (order.orderType === "softcopy" && updatedOrder?.download) {
      const downloadUrl = `${process.env.NEXTAUTH_URL}/api/products/download?token=${updatedOrder.download.downloadToken}&orderId=${orderId}`;

      await sendEmail({
        to: order.customerEmail,
        ...emailTemplates.downloadLinkEmail(order.customerName, {
          productTitle: order.productTitle,
          productThumbnail: order.productThumbnail,
          orderNumber: order.orderNumber,
          downloadUrl,
          expiryDate: updatedOrder.download.tokenExpiry,
          maxDownloads: updatedOrder.download.maxDownloads,
        }),
      });

      // Mark download email as sent
      await OrderRepository.updateEmailTracking(orderId, "downloadLink");

      // Invalidate relevant caches immediately
      revalidateTag(CACHE_TAGS.ORDERS);
      revalidateTag(CACHE_TAGS.PRODUCTS);
      revalidateTag(CACHE_TAGS.PAYMENTS);
      revalidateTag(CACHE_TAGS.DASHBOARD);

      return NextResponse.json({
        success: true,
        order: {
          ...updatedOrder,
          _id: updatedOrder._id?.toString(),
          productId: updatedOrder.productId.toString(),
        },
        downloadUrl,
      });
    }

    // Invalidate relevant caches immediately
    revalidateTag(CACHE_TAGS.ORDERS);
    revalidateTag(CACHE_TAGS.PRODUCTS);
    revalidateTag(CACHE_TAGS.PAYMENTS);
    revalidateTag(CACHE_TAGS.DASHBOARD);

    return NextResponse.json({
      success: true,
      order: {
        ...updatedOrder,
        _id: updatedOrder?._id?.toString(),
        productId: updatedOrder?.productId.toString(),
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
