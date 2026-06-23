import { ObjectId } from "mongodb";

export type ParentInvoiceStatus =
  | "draft"
  | "paid"
  | "cancelled"
  | "pending_payment"
  // Legacy approval-workflow statuses (no longer part of the active flow,
  // retained so existing/legacy invoices and routes type-check).
  | "pending_approval"
  | "approved"
  | "rejected";

export type ParentInvoiceSessionKind = "past" | "future";

export interface ParentInvoiceLineItem {
  date: string;
  childName: string;
  serviceType: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  sessionKind: ParentInvoiceSessionKind;
  tutoringLocation?: "virtual" | "physical";
}

export interface ParentInvoiceInterface {
  _id?: ObjectId;
  userId: ObjectId;
  linkedBookingId?: ObjectId;
  invoiceNumber: string;
  status: ParentInvoiceStatus;
  lineItems: ParentInvoiceLineItem[];
  subtotal: number;
  totalAmount: number;
  currency: string;
  paymentDueDate?: string;
  approval?: {
    submittedAt?: Date;
    reviewedAt?: Date;
    reviewedBy?: ObjectId;
    rejectionReason?: string;
  };
  payment?: {
    status: "pending" | "paid" | "failed";
    paidAmount?: number;
    transactionId?: string;
    paidAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}
