import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";

export interface BookingPaymentInput {
  bookingId: string;
  userId?: string;
  amount: number;
  currency?: string;
  email?: string;
}

export async function initializeBookingPayment(
  input: BookingPaymentInput,
  options?: { toastId?: string },
): Promise<boolean> {
  const toastId = options?.toastId ?? "booking-payment";

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

  const paymentData = await paymentRes.json();

  if (!paymentData.success || !paymentData.data?.authorization_url) {
    toast.dismiss(toastId);
    toast.error(paymentData.error || "Payment initialization failed");
    return false;
  }

  toast.dismiss(toastId);
  toast.success("Redirecting to secure payment...", { duration: 500 });
  window.location.href = paymentData.data.authorization_url;
  return true;
}
