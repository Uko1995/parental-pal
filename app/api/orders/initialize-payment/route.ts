import { NextRequest, NextResponse } from "next/server";
import OrderRepository from "@/lib/OrderRepository";

// POST /api/orders/initialize-payment - Initialize Paystack payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Get order details
    const order = await OrderRepository.getOrderById(body.orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Check if already paid
    if (order.payment.status === "success" || order.status === "paid") {
      return NextResponse.json(
        { success: false, error: "Order already paid" },
        { status: 400 }
      );
    }

    // Initialize Paystack payment
    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: order.customerEmail,
          amount: Math.round(order.totalAmount * 100), // Convert to kobo
          currency: order.currency,
          reference: order.payment.reference,
          callback_url: `${
            process.env.NEXTAUTH_URL
          }/payment/order-callback?orderId=${order._id?.toString()}`,
          metadata: {
            orderId: order._id?.toString(),
            orderNumber: order.orderNumber,
            productId: order.productId.toString(),
            productTitle: order.productTitle,
            orderType: order.orderType,
            customerName: order.customerName,
          },
        }),
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      console.error("Paystack initialization failed:", paystackData);
      return NextResponse.json(
        { success: false, error: "Failed to initialize payment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        authorization_url: paystackData.data.authorization_url,
        access_code: paystackData.data.access_code,
        reference: paystackData.data.reference,
      },
    });
  } catch (error) {
    console.error("Error initializing payment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
