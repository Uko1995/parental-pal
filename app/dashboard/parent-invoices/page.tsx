import ParentInvoiceAdminList from "./ParentInvoiceAdminList";

export default function ParentInvoicesDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-base-content">Parent Invoices</h1>
        <p className="text-sm text-base-content/70 mt-1">
          View all parent invoices across every status, including drafts you
          create.
        </p>
      </div>
      <ParentInvoiceAdminList />
    </div>
  );
}
