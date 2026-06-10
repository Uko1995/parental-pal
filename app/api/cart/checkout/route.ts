import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@/auth";
import CartRepository from "@/lib/CartRepository";
import OrderRepository from "@/lib/OrderRepository";
import ProductRepository from "@/lib/ProductRepository";
import CouponRepository from "@/lib/CouponRepository";
import {
  getEffectiveCartItemUnitPrice,
  isBdgPromoCode,
} from "@/lib/product-promotions";
import { OrderInterface } from "@/models/Order";
import { ObjectId } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import { CACHE_TAGS } from "@/lib/cache-config";

// POST /api/cart/checkout - Create orders from cart and initialize payment
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Please login to checkout" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate customer info
    if (!body.customerName || !body.customerEmail || !body.customerPhone) {
      return NextResponse.json(
        { success: false, error: "Customer information is required" },
        { status: 400 }
      );
    }

    // Get cart
    const cart = await CartRepository.getCartByUserId(session.user.id);
    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Your cart is empty" },
        { status: 400 }
      );
    }

    // Check if any items require delivery address
    const hasPaperback = cart.items.some(
      (item) => item.orderType === "paperback"
    );
    if (hasPaperback) {
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

    // Validate all products are still available
    for (const item of cart.items) {
      const product = await ProductRepository.getProductById(item.productId);
      if (!product || product.status !== "active") {
        return NextResponse.json(
          {
            success: false,
            error: `"${item.productTitle}" is no longer available`,
          },
          { status: 400 }
        );
      }

      if (
        item.orderType === "paperback" &&
        product.stock.paperback < item.quantity
      ) {
        return NextResponse.json(
          {
            success: false,
            error: `"${item.productTitle}" paperback is out of stock`,
          },
          { status: 400 }
        );
      }
    }

    // Calculate totals
    const totals = CartRepository.calculateTotals(cart);

    // Create a single payment reference for all orders
    const batchReference = `BATCH-${Date.now()}-${uuidv4().slice(0, 8)}`;
    const idempotencyKey = uuidv4();

    // Create orders for each cart item
    const orders: OrderInterface[] = [];

    for (const item of cart.items) {
      const product = await ProductRepository.getProductById(item.productId);
      if (!product) continue;

      const productCategory = product.category;
      let unitPrice = item.unitPrice;
      let itemTotal: number;

      if (isBdgPromoCode(cart.couponCode)) {
        unitPrice = getEffectiveCartItemUnitPrice(
          {
            orderType: item.orderType,
            unitPrice: item.unitPrice,
            productCategory,
          },
          cart.couponCode,
        );
        itemTotal = unitPrice * item.quantity;
      } else {
        const itemSubtotal = item.unitPrice * item.quantity;
        let itemDiscount = 0;

        if (totals.discount > 0) {
          itemDiscount = Math.round(
            (itemSubtotal / totals.subtotal) * totals.discount,
          );
        }

        itemTotal = itemSubtotal - itemDiscount;
      }

      const orderData: Omit<
        OrderInterface,
        "_id" | "orderNumber" | "createdAt" | "updatedAt"
      > = {
        userId: new ObjectId(session.user.id),
        customerEmail: body.customerEmail,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        productId: item.productId,
        productTitle: item.productTitle,
        productThumbnail: item.productThumbnail,
        orderType: item.orderType,
        unitPrice,
        quantity: item.quantity,
        totalAmount: itemTotal,
        currency: "NGN",
        payment: {
          reference: `${batchReference}-${orders.length + 1}`,
          status: "pending",
          method: "card",
          amount: itemTotal,
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
        idempotencyKey: `${idempotencyKey}-${orders.length + 1}`,
      };

      // Add delivery info for paperback
      if (item.orderType === "paperback") {
        const estimatedDeliveryDate = new Date();
        estimatedDeliveryDate.setDate(
          estimatedDeliveryDate.getDate() +
            (product.pricing.paperback.deliveryDays || 3)
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

      const order = await OrderRepository.createOrder(orderData);
      orders.push(order);
    }

    // Record coupon usage if applied (database coupons only)
    if (
      cart.couponCode &&
      totals.discount > 0 &&
      !isBdgPromoCode(cart.couponCode)
    ) {
      const coupon = await CouponRepository.getCouponByCode(cart.couponCode);
      if (coupon && coupon._id) {
        // Record usage for first order (we track by user)
        await CouponRepository.recordUsage(
          coupon._id,
          cart.couponCode,
          new ObjectId(session.user.id),
          orders[0]._id!,
          totals.discount
        );
      }
    }

    // Initialize Paystack payment for total amount
    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: body.customerEmail,
          amount: Math.round(totals.total * 100), // Convert to kobo
          currency: "NGN",
          reference: batchReference,
          callback_url: `${process.env.NEXTAUTH_URL}/payment/cart-callback`,
          metadata: {
            orderIds: orders.map((o) => o._id?.toString()),
            orderNumbers: orders.map((o) => o.orderNumber),
            cartTotal: totals.total,
            itemCount: cart.items.length,
            customerName: body.customerName,
            couponCode: cart.couponCode,
            discount: totals.discount,
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

    // Invalidate caches immediately
    revalidateTag(CACHE_TAGS.CART);
    revalidateTag(CACHE_TAGS.ORDERS);
    revalidateTag(CACHE_TAGS.COUPONS);

    // Store batch reference in session or return it
    return NextResponse.json({
      success: true,
      message: "Checkout initiated",
      data: {
        authorization_url: paystackData.data.authorization_url,
        access_code: paystackData.data.access_code,
        reference: batchReference,
        orderIds: orders.map((o) => o._id?.toString()),
        orderNumbers: orders.map((o) => o.orderNumber),
        totals,
      },
    });
  } catch (error) {
    console.error("Error during checkout:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process checkout" },
      { status: 500 }
    );
  }
}
