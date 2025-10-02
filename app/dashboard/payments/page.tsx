import {
  CreditCardIcon,
  PlusIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-1">
            Track payments, process refunds, and manage financial records
          </p>
        </div>
        <button className="btn btn-primary">
          <PlusIcon className="w-5 h-5 mr-2" />
          Process Payment
        </button>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat bg-base-100 shadow rounded-2xl">
          <div className="stat-title">Total Revenue</div>
          <div className="stat-value text-success">₦2.34M</div>
          <div className="stat-desc">↗️ 12.5% this month</div>
        </div>

        <div className="stat bg-base-100 shadow rounded-2xl">
          <div className="stat-title">Pending Payments</div>
          <div className="stat-value text-warning">₦145K</div>
          <div className="stat-desc">23 transactions</div>
        </div>

        <div className="stat bg-base-100 shadow rounded-2xl">
          <div className="stat-title">Overdue</div>
          <div className="stat-value text-error">₦45K</div>
          <div className="stat-desc">⚠️ Requires attention</div>
        </div>

        <div className="stat bg-base-100 shadow rounded-2xl">
          <div className="stat-title">Processed Today</div>
          <div className="stat-value text-info">₦67K</div>
          <div className="stat-desc">12 transactions</div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title text-error">
              <ExclamationTriangleIcon className="w-6 h-6" />
              Payment Alerts
            </h2>
            <div className="space-y-3">
              <div className="alert alert-warning">
                <span>3 payments overdue - total ₦45,000</span>
              </div>
              <div className="alert alert-info">
                <span>5 payments due today - total ₦125,000</span>
              </div>
              <div className="alert alert-error">
                <span>1 failed payment requires manual review</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">Recent Transactions</h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-base-50 rounded-lg">
                <div>
                  <p className="font-medium">Academic Tutoring</p>
                  <p className="text-sm text-gray-500">Sarah Johnson</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-success">₦45,000</p>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-base-50 rounded-lg">
                <div>
                  <p className="font-medium">Daily Childcare</p>
                  <p className="text-sm text-gray-500">Michael Chen</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-warning">₦150,000</p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payments Management Placeholder */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="h-64 bg-gradient-to-r from-[#90AC19]/10 to-[#E8931A]/10 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <CreditCardIcon className="w-20 h-20 text-[#90AC19] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Management System
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Complete payment processing with transaction history, automated
                billing, refunds, and financial reporting features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
