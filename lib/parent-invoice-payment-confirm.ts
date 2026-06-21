import { revalidateTag } from "next/cache";
import { ObjectId } from "mongodb";
import { ParentInvoiceRepository } from "@/lib/ParentInvoiceRepository";
import { findPaymentByReference } from "@/lib/PaymentRepository";
import { getCollection } from "@/lib/mongodb";
import { PaymentInterface } from "@/models/Payment";
import { CACHE_TAGS } from "@/lib/cache-config";
import { paymentAmountMatches } from "@/lib/booking-payment-confirm";
import type { PaystackVerifyResponse } from "@/lib/booking-payment-confirm";

export interface ConfirmParentInvoicePaymentResult {
  success: boolean;
  alreadyPaid: boolean;
  invoiceId?: string;
  error?: string;
}

export async function confirmParentInvoicePayment(input: {
  reference: string;
  paystackData: PaystackVerifyResponse;
}): Promise<ConfirmParentInvoicePaymentResult> {
  const { reference, paystackData } = input;

  if (!paystackData.status || !paystackData.data) {
    return { success: false, alreadyPaid: false, error: "Invalid Paystack data" };
  }

  if (paystackData.data.status !== "success") {
    return { success: false, alreadyPaid: false, error: "Payment not successful" };
  }

  const parentInvoiceId = paystackData.data.metadata?.parentInvoiceId as
    | string
    | undefined;
  if (!parentInvoiceId) {
    return {
      success: false,
      alreadyPaid: false,
      error: "Missing parent invoice in payment metadata",
    };
  }

  const invoice = await ParentInvoiceRepository.findById(parentInvoiceId);
  if (!invoice) {
    return { success: false, alreadyPaid: false, error: "Invoice not found" };
  }

  if (invoice.status === "paid") {
    return { success: true, alreadyPaid: true, invoiceId: parentInvoiceId };
  }

  if (
    invoice.status !== "pending_payment" &&
    invoice.status !== "approved"
  ) {
    return {
      success: false,
      alreadyPaid: false,
      error: "Invoice is not approved for payment",
    };
  }

  const paidAmount = (paystackData.data.amount || 0) / 100;
  if (!paymentAmountMatches(paidAmount, invoice.totalAmount)) {
    return {
      success: false,
      alreadyPaid: false,
      error: "Payment amount does not match invoice total",
    };
  }

  const existingPayment = await findPaymentByReference(reference);
  const payments = await getCollection<PaymentInterface>("payments");

  if (existingPayment) {
    await payments.updateOne(
      { reference },
      {
        $set: {
          status: "success",
          gatewayResponse: paystackData.data.gateway_response || "",
          paystackResponse: paystackData,
          updatedAt: new Date(),
        },
      },
    );
  }

  await ParentInvoiceRepository.update(parentInvoiceId, {
    status: "paid",
    payment: {
      status: "paid",
      paidAmount,
      transactionId: reference,
      paidAt: new Date(),
    },
  });

  revalidateTag(CACHE_TAGS.PAYMENTS);

  return { success: true, alreadyPaid: false, invoiceId: parentInvoiceId };
}
