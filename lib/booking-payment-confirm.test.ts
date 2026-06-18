import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "crypto";
import {
  paymentAmountMatches,
  resolveBookingId,
  validatePaystackReconcileBooking,
  validatePaystackWebhookSignature,
} from "./booking-payment-confirm";
import type { PaystackVerifyResponse } from "./booking-payment-confirm";
import { ObjectId } from "mongodb";

describe("booking-payment-confirm", () => {
  const originalSecret = process.env.PAYSTACK_SECRET_KEY;

  it("validates Paystack webhook HMAC signature", () => {
    process.env.PAYSTACK_SECRET_KEY = "test_secret_key";
    const body = JSON.stringify({
      event: "charge.success",
      data: { reference: "T1" },
    });
    const signature = createHmac("sha512", "test_secret_key")
      .update(body)
      .digest("hex");

    assert.equal(validatePaystackWebhookSignature(body, signature), true);
    assert.equal(validatePaystackWebhookSignature(body, "invalid"), false);
    assert.equal(validatePaystackWebhookSignature(body, null), false);

    if (originalSecret !== undefined) {
      process.env.PAYSTACK_SECRET_KEY = originalSecret;
    } else {
      delete process.env.PAYSTACK_SECRET_KEY;
    }
  });

  it("rejects mismatched webhook signatures", () => {
    process.env.PAYSTACK_SECRET_KEY = "test_secret_key";
    const body = '{"event":"charge.success"}';
    assert.equal(
      validatePaystackWebhookSignature(body, "a".repeat(128)),
      false,
    );
    if (originalSecret !== undefined) {
      process.env.PAYSTACK_SECRET_KEY = originalSecret;
    } else {
      delete process.env.PAYSTACK_SECRET_KEY;
    }
  });

  it("resolves booking ID from explicit id, payment row, or metadata", () => {
    const bookingId = "507f1f77bcf86cd799439011";
    const paystackData: PaystackVerifyResponse = {
      status: true,
      data: {
        status: "success",
        reference: "T123",
        amount: 6500000,
        currency: "NGN",
        metadata: { bookingId },
      },
    };

    assert.equal(resolveBookingId(bookingId, null, paystackData), bookingId);

    const savedPayment = {
      bookingId: new ObjectId(bookingId),
    } as Parameters<typeof resolveBookingId>[1];
    assert.equal(
      resolveBookingId(undefined, savedPayment, { status: true }),
      bookingId,
    );

    assert.equal(
      resolveBookingId(undefined, null, paystackData),
      bookingId,
    );

    assert.equal(
      resolveBookingId(undefined, null, { status: true, data: undefined }),
      null,
    );
  });

  it("validates payment amount within tolerance", () => {
    assert.equal(paymentAmountMatches(65000, 65000), true);
    assert.equal(paymentAmountMatches(65000.005, 65000), true);
    assert.equal(paymentAmountMatches(64000, 65000), false);
  });

  it("validates Paystack reconcile metadata against booking", () => {
    const bookingId = "booking-abc";

    assert.deepEqual(
      validatePaystackReconcileBooking(bookingId, bookingId),
      { valid: true },
    );
    assert.deepEqual(
      validatePaystackReconcileBooking(bookingId, undefined),
      { valid: true },
    );
    assert.deepEqual(
      validatePaystackReconcileBooking(bookingId, "other-booking"),
      {
        valid: false,
        error: "This Paystack reference belongs to a different booking",
      },
    );
  });
});
