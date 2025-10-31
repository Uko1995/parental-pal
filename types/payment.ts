export interface PaystackInitResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaymentInitRequest {
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  email: string;
  idempotencyKey: string;
}

export interface PaymentVerifyResponse {
  status: boolean;
  message: string;
  data: unknown;
}
