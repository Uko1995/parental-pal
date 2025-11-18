import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import OrderRepository from "@/lib/OrderRepository";
import ProductRepository from "@/lib/ProductRepository";
import { OrderInterface } from "@/models/Order";
import { v4 as uuidv4 } from "uuid";

// GET /api/orders - Get all orders
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || undefined;
    const orderType = searchParams.get("orderType") || undefined;
    const customerEmail = searchParams.get("customerEmail") || undefined;

    const filters: {
      status?: string;
      orderType?: string;
      customerEmail?: string;
    } = {};

    if (status) filters.status = status;
    if (orderType) filters.orderType = orderType;
    if (customerEmail) filters.customerEmail = customerEmail;

    const orders = await OrderRepository.getAllOrders(filters);

    // Convert ObjectIds to strings
    const serializedOrders = orders.map((order) => ({
      ...order,
      _id: order._id?.toString(),
      userId: order.userId?.toString(),
      productId: order.productId.toString(),
      delivery: order.delivery
        ? {
            ...order.delivery,
            estimatedDeliveryDate:
              order.delivery.estimatedDeliveryDate?.toISOString(),
            actualDeliveryDate:
              order.delivery.actualDeliveryDate?.toISOString(),
          }
        : undefined,
      payment: {
        ...order.payment,
        paidAt: order.payment.paidAt?.toISOString(),
      },
      download: order.download
        ? {
            ...order.download,
            tokenExpiry: order.download.tokenExpiry.toISOString(),
            lastDownloadAt: order.download.lastDownloadAt?.toISOString(),
          }
        : undefined,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      paidAt: order.paidAt?.toISOString(),
      shippedAt: order.shippedAt?.toISOString(),
      deliveredAt: order.deliveredAt?.toISOString(),
      cancelledAt: order.cancelledAt?.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: serializedOrders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const session = await auth();

    // Validate required fields
    if (
      !body.productId ||
      !body.orderType ||
      !body.customerName ||
      !body.customerEmail ||
      !body.customerPhone
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get product details
    const product = await ProductRepository.getProductById(body.productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Check product availability
    if (product.status !== "active") {
      return NextResponse.json(
        { success: false, error: "Product is not available" },
        { status: 400 }
      );
    }

    // Check stock for paperback
    if (body.orderType === "paperback") {
      const hasStock = await ProductRepository.checkStock(
        body.productId,
        "paperback",
        body.quantity || 1
      );
      if (!hasStock) {
        return NextResponse.json(
          { success: false, error: "Product is out of stock" },
          { status: 400 }
        );
      }

      // Validate delivery address
      if (!body.address || !body.city || !body.state || !body.country) {
        return NextResponse.json(
          {
            success: false,
            error: "Delivery address is required for paperback orders",
          },
          { status: 400 }
        );
      }
    }

    // Calculate price
    const quantity = body.quantity || 1;
    const unitPrice =
      body.orderType === "softcopy"
        ? product.pricing.softcopy.price
        : product.pricing.paperback.price;
    const totalAmount = unitPrice * quantity;

    // Generate unique reference for Paystack
    const paymentReference = `PAY-${Date.now()}-${uuidv4().slice(0, 8)}`;
    const idempotencyKey = uuidv4();

    // Build order data
    const orderData: Omit<
      OrderInterface,
      "_id" | "orderNumber" | "createdAt" | "updatedAt"
    > = {
      userId: session?.user?.id
        ? (session.user.id as unknown as import("mongodb").ObjectId)
        : undefined,
      customerEmail: body.customerEmail,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      productId: product._id!,
      productTitle: product.title,
      productThumbnail: product.thumbnail,
      orderType: body.orderType,
      unitPrice,
      quantity,
      totalAmount,
      currency: "NGN",
      payment: {
        reference: paymentReference,
        status: "pending",
        method: "card",
        amount: totalAmount,
        currency: "NGN",
      },
      status: "pending",
      emailsSent: {
        confirmation: false,
        downloadLink: false,
        shippingNotification: false,
        deliveryConfirmation: false,
      },
      customerNotes: body.customerNotes,
      idempotencyKey,
    };

    // Add delivery info for paperback
    if (body.orderType === "paperback") {
      const estimatedDeliveryDate = new Date();
      estimatedDeliveryDate.setDate(
        estimatedDeliveryDate.getDate() + product.pricing.paperback.deliveryDays
      );

      orderData.delivery = {
        address: body.address,
        city: body.city,
        state: body.state,
        postalCode: body.postalCode,
        country: body.country,
        deliveryNotes: body.deliveryNotes,
        estimatedDeliveryDate,
      };
    }

    const newOrder = await OrderRepository.createOrder(orderData);

    return NextResponse.json(
      {
        success: true,
        data: {
          ...newOrder,
          _id: newOrder._id?.toString(),
          userId: newOrder.userId?.toString(),
          productId: newOrder.productId.toString(),
          createdAt: newOrder.createdAt.toISOString(),
          updatedAt: newOrder.updatedAt.toISOString(),
          download: newOrder.download
            ? {
                ...newOrder.download,
                tokenExpiry: newOrder.download.tokenExpiry.toISOString(),
              }
            : undefined,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}
