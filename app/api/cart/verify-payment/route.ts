import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import OrderRepository from "@/lib/OrderRepository";
import ProductRepository from "@/lib/ProductRepository";
import CartRepository from "@/lib/CartRepository";
import { sendEmail, emailTemplates } from "@/lib/email-service";
import { auth } from "@/auth";
import { CACHE_TAGS } from "@/lib/cache-config";
import { createPayment, findPaymentByReference } from "@/lib/PaymentRepository";
import { ObjectId } from "mongodb";

// GET /api/cart/verify-payment - Verify batch Paystack payment
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { success: false, error: "Missing reference" },
        { status: 400 }
      );
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
      return NextResponse.json(
        { success: false, error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Get order IDs from metadata
    const metadata = paystackData.data.metadata;
    const orderIds = metadata?.orderIds || [];

    if (orderIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "No orders found for this payment" },
        { status: 400 }
      );
    }

    const results = [];

    // Save payment to payments collection (once for the entire cart transaction)
    const existingPayment = await findPaymentByReference(reference);
    if (!existingPayment) {
      await createPayment({
        bookingId: new ObjectId(orderIds[0]), // Use first order as reference
        userId: metadata?.userId
          ? new ObjectId(metadata.userId)
          : new ObjectId(),
        amount: paystackData.data.amount / 100, // Convert from kobo to naira
        currency: paystackData.data.currency,
        status: "success",
        reference: reference,
        channel: paystackData.data.channel,
        gatewayResponse: `Cart payment successful - ${orderIds.length} orders`,
        paystackResponse: paystackData,
        idempotencyKey: `${reference}-cart`,
      });
    }

    // Process each order
    for (const orderId of orderIds) {
      const order = await OrderRepository.getOrderById(orderId);
      if (!order) continue;

      // Skip if already processed
      if (order.payment.status === "success") {
        const updatedOrder = await OrderRepository.getOrderById(orderId);
        results.push({
          orderNumber: order.orderNumber,
          productTitle: order.productTitle,
          orderType: order.orderType,
          downloadUrl:
            order.orderType === "softcopy" && updatedOrder?.download
              ? `${process.env.NEXTAUTH_URL}/api/products/download?token=${updatedOrder.download.downloadToken}&orderId=${orderId}`
              : undefined,
        });
        continue;
      }

      // Update payment status
      await OrderRepository.updatePaymentStatus(orderId, {
        status: "success",
        paidAt: new Date(),
        method: paystackData.data.channel,
        gatewayResponse: "Payment successful",
        paystackResponse: paystackData,
      });

      // Update order status
      await OrderRepository.updateOrderStatus(orderId, "paid");

      // Update product sales metrics
      await ProductRepository.updateSalesMetrics(
        order.productId,
        order.orderType,
        order.totalAmount,
        order.quantity
      );

      // Get updated order with download token
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

      await OrderRepository.updateEmailTracking(orderId, "confirmation");

      // For softcopy, send download link
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

        await OrderRepository.updateEmailTracking(orderId, "downloadLink");

        results.push({
          orderNumber: order.orderNumber,
          productTitle: order.productTitle,
          orderType: order.orderType,
          downloadUrl,
        });
      } else {
        results.push({
          orderNumber: order.orderNumber,
          productTitle: order.productTitle,
          orderType: order.orderType,
        });
      }
    }

    // Clear cart after successful payment
    const session = await auth();
    if (session?.user?.id) {
      await CartRepository.clearCart(session.user.id);
    }

    // Invalidate all relevant caches immediately
    revalidateTag(CACHE_TAGS.CART);
    revalidateTag(CACHE_TAGS.ORDERS);
    revalidateTag(CACHE_TAGS.PRODUCTS);
    revalidateTag(CACHE_TAGS.PAYMENTS);
    revalidateTag(CACHE_TAGS.DASHBOARD);

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      orders: results,
    });
  } catch (error) {
    console.error("Cart payment verification error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
