import {
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage platform settings, preferences, and configurations
          </p>
        </div>
        <button className="btn btn-primary">Save All Changes</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body p-4">
              <h2 className="card-title text-lg mb-4">Settings Categories</h2>
              <ul className="menu menu-vertical space-y-1">
                <li>
                  <a className="active text-primary">
                    <UserIcon className="w-5 h-5" />
                    General
                  </a>
                </li>
                <li>
                  <a>
                    <BellIcon className="w-5 h-5" />
                    Notifications
                  </a>
                </li>
                <li>
                  <a>
                    <ShieldCheckIcon className="w-5 h-5" />
                    Security
                  </a>
                </li>
                <li>
                  <a>
                    <CurrencyDollarIcon className="w-5 h-5" />
                    Billing
                  </a>
                </li>
                <li>
                  <a>
                    <BuildingOfficeIcon className="w-5 h-5" />
                    Business
                  </a>
                </li>
                <li>
                  <a>
                    <GlobeAltIcon className="w-5 h-5" />
                    API & Integrations
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* General Settings */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title mb-4">
                <UserIcon className="w-6 h-6 text-primary" />
                General Settings
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Platform Name
                    </span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value="PARENTALPAL"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Admin Email</span>
                  </label>
                  <input
                    type="email"
                    className="input input-bordered"
                    value="admin@parentalpal.com"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Contact Phone
                    </span>
                  </label>
                  <input
                    type="tel"
                    className="input input-bordered"
                    placeholder="+234 XXX XXX XXXX"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Time Zone</span>
                  </label>
                  <select className="select select-bordered">
                    <option>Africa/Lagos (WAT)</option>
                    <option>UTC</option>
                    <option>America/New_York</option>
                  </select>
                </div>
              </div>

              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text font-medium">
                    Business Address
                  </span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-20"
                  placeholder="Enter your business address..."
                ></textarea>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title mb-4">
                <BellIcon className="w-6 h-6 text-secondary" />
                Notification Preferences
              </h2>

              <div className="space-y-4">
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">
                      Email notifications for new bookings
                    </span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      defaultChecked
                    />
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">
                      SMS alerts for urgent matters
                    </span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      defaultChecked
                    />
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Weekly revenue reports</span>
                    <input type="checkbox" className="toggle toggle-primary" />
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">
                      Payment confirmation emails
                    </span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      defaultChecked
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title mb-4">
                <ShieldCheckIcon className="w-6 h-6 text-accent" />
                Security & Privacy
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-base-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <KeyIcon className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500">
                        Add an extra layer of security
                      </p>
                    </div>
                  </div>
                  <button className="btn btn-sm btn-outline btn-primary">
                    Enable 2FA
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-base-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <KeyIcon className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Change Password</p>
                      <p className="text-sm text-gray-500">
                        Update your account password
                      </p>
                    </div>
                  </div>
                  <button className="btn btn-sm btn-outline btn-secondary">
                    Change
                  </button>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">
                      Require password for sensitive actions
                    </span>
                    <input
                      type="checkbox"
                      className="toggle toggle-accent"
                      defaultChecked
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Settings */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title mb-4">
                <CurrencyDollarIcon className="w-6 h-6 text-success" />
                Payment & Billing Settings
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Default Currency
                    </span>
                  </label>
                  <select className="select select-bordered">
                    <option>Nigerian Naira (₦)</option>
                    <option>US Dollar ($)</option>
                    <option>British Pound (£)</option>
                    <option>Euro (€)</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Payment Due Days
                    </span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value="7"
                    min="1"
                    max="30"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Late Payment Fee (%)
                    </span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value="5"
                    min="0"
                    max="100"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Auto-invoice Generation
                    </span>
                  </label>
                  <select className="select select-bordered">
                    <option>Immediate</option>
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Manual</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">
                      Send payment reminders automatically
                    </span>
                    <input
                      type="checkbox"
                      className="toggle toggle-success"
                      defaultChecked
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* API & Integration Settings */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title mb-4">
                <GlobeAltIcon className="w-6 h-6 text-info" />
                API & Integrations
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-base-50 rounded-lg">
                  <div>
                    <p className="font-medium">Google Sheets Backup</p>
                    <p className="text-sm text-gray-500">
                      Automatically backup form data
                    </p>
                  </div>
                  <div className="badge badge-success">Connected</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-base-50 rounded-lg">
                  <div>
                    <p className="font-medium">MongoDB Atlas</p>
                    <p className="text-sm text-gray-500">
                      Primary database connection
                    </p>
                  </div>
                  <div className="badge badge-success">Connected</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-base-50 rounded-lg">
                  <div>
                    <p className="font-medium">Payment Gateway</p>
                    <p className="text-sm text-gray-500">
                      Process online payments
                    </p>
                  </div>
                  <button className="btn btn-sm btn-outline btn-warning">
                    Configure
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-base-50 rounded-lg">
                  <div>
                    <p className="font-medium">Email Service</p>
                    <p className="text-sm text-gray-500">
                      Automated email notifications
                    </p>
                  </div>
                  <button className="btn btn-sm btn-outline btn-warning">
                    Setup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
