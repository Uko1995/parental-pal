import ParentInvoiceApprovalQueue from "./ParentInvoiceApprovalQueue";

export default function ParentInvoicesDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-base-content">
          Parent Invoice Approvals
        </h1>
        <p className="text-sm text-base-content/70 mt-1">
          Review session invoices submitted by parents before they can pay.
        </p>
      </div>
      <ParentInvoiceApprovalQueue />
    </div>
  );
}
