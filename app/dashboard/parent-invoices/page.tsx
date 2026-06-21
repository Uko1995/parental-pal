import ParentInvoiceApprovalQueue from "./ParentInvoiceApprovalQueue";

export default function ParentInvoicesDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-base-content">
          Submitted Session Invoices
        </h1>
        <p className="text-sm text-base-content/70 mt-1">
          Review invoices parents have submitted for payment. Approval is not
          required before they pay.
        </p>
      </div>
      <ParentInvoiceApprovalQueue />
    </div>
  );
}
