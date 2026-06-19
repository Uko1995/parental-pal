import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";

export interface BookingPaymentInput {
  bookingId: string;
  userId?: string;
  amount: number;
  currency?: string;
  email?: string;
}

export type BookingPaymentErrorCode =
  | "unauthorized"
  | "rate_limited"
  | "amount_mismatch"
  | "unavailable"
  | "network"
  | "unknown";

export type BookingPaymentResult =
  | { ok: true }
  | { ok: false; error: string; code: BookingPaymentErrorCode };

function mapPaymentError(
  status: number,
  message: string,
): { error: string; code: BookingPaymentErrorCode } {
  const normalized = message.toLowerCase();

  if (status === 401) {
    return {
      error: "Your session expired. Please sign in again to continue.",
      code: "unauthorized",
    };
  }

  if (status === 429 || normalized.includes("too many payment")) {
    return {
      error:
        "Too many payment attempts. Wait a few minutes, or pay from Profile → Payments.",
      code: "rate_limited",
    };
  }

  if (
    normalized.includes("invalid payment amount") ||
    normalized.includes("amount mismatch")
  ) {
    return {
      error:
        "The booking price changed. Refresh the page and submit again before paying.",
      code: "amount_mismatch",
    };
  }

  if (
    normalized.includes("paystack") ||
    normalized.includes("secret") ||
    normalized.includes("payment service")
  ) {
    return {
      error:
        "Online payment is temporarily unavailable. Your booking is saved — pay from Profile → Payments or contact support.",
      code: "unavailable",
    };
  }

  return {
    error: message || "Payment initialization failed",
    code: "unknown",
  };
}

export async function initializeBookingPayment(
  input: BookingPaymentInput,
  options?: { toastId?: string; showToast?: boolean },
): Promise<BookingPaymentResult> {
  const toastId = options?.toastId ?? "booking-payment";
  const showToast = options?.showToast ?? true;

  try {
    const paymentRes = await fetch("/api/payments/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId: input.bookingId,
        userId: input.userId,
        amount: input.amount,
        currency: input.currency || "NGN",
        email: input.email,
        idempotencyKey: uuidv4(),
      }),
    });

    let paymentData: {
      success?: boolean;
      error?: string;
      data?: { authorization_url?: string };
    } = {};

    try {
      paymentData = await paymentRes.json();
    } catch {
      paymentData = {};
    }

    if (!paymentData.success || !paymentData.data?.authorization_url) {
      const mapped = mapPaymentError(
        paymentRes.status,
        paymentData.error || "Payment initialization failed",
      );

      if (showToast) {
        toast.dismiss(toastId);
        toast.error(mapped.error);
      }

      return { ok: false, ...mapped };
    }

    if (showToast) {
      toast.dismiss(toastId);
      toast.success("Redirecting to secure payment...", { duration: 2000 });
    }

    window.location.href = paymentData.data.authorization_url;
    return { ok: true };
  } catch (error) {
    const networkError =
      "Could not reach the payment service. Check your connection and try again from Profile → Payments.";

    if (showToast) {
      toast.dismiss(toastId);
      toast.error(networkError);
    }

    console.error("Payment initialization error:", error);
    return { ok: false, error: networkError, code: "network" };
  }
}
