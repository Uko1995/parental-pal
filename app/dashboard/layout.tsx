"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  ChartBarIcon,
  UsersIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  badge?: string;
}

const navigation: NavigationItem[] = [
  { name: "Overview", href: "/dashboard", icon: HomeIcon },
  { name: "Analytics", href: "/dashboard/analytics", icon: ChartBarIcon },
  { name: "Tutors", href: "/dashboard/tutors", icon: AcademicCapIcon },
  { name: "Parents", href: "/dashboard/parents", icon: UsersIcon },
  { name: "Children", href: "/dashboard/children", icon: UserGroupIcon },
  {
    name: "Bookings",
    href: "/dashboard/bookings",
    icon: CalendarDaysIcon,
    badge: "12",
  },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCardIcon },
  { name: "Services", href: "/dashboard/services", icon: BuildingOfficeIcon },
  { name: "Blog", href: "/dashboard/blog", icon: DocumentTextIcon },
  { name: "Settings", href: "/dashboard/settings", icon: Cog6ToothIcon },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isActivePath = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50">
        <div className="flex flex-col flex-grow bg-white shadow-xl border-r border-base-200">
          {/* Logo */}
          <div className="flex items-center justify-center px-6 py-8 bg-gradient-to-r from-[#90AC19] to-[#E8931A]">
            <Link href="/" className="text-white font-bold text-xl">
              PARENTALPAL
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = isActivePath(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? "bg-[#90AC19] text-white shadow-lg"
                        : "text-gray-700 hover:bg-base-200 hover:text-[#90AC19]"
                    }
                  `}
                >
                  <div className="flex items-center">
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        isActive ? "text-white" : "text-gray-500"
                      }`}
                    />
                    {item.name}
                  </div>
                  {item.badge && (
                    <span
                      className={`
                        inline-flex items-center px-2 py-1 text-xs font-medium rounded-full
                        ${
                          isActive
                            ? "bg-white text-[#90AC19]"
                            : "bg-[#E8931A] text-white"
                        }
                      `}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-base-200">
            <div className="flex items-center space-x-3 p-3 bg-base-50 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-[#A25F97] to-[#E8931A] rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">AD</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">admin@parentalpal.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 lg:hidden
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Mobile header */}
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#90AC19] to-[#E8931A]">
            <Link href="/" className="text-white font-bold text-lg">
              PARENTALPAL
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded-md"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = isActivePath(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? "bg-[#90AC19] text-white shadow-lg"
                        : "text-gray-700 hover:bg-base-200 hover:text-[#90AC19]"
                    }
                  `}
                >
                  <div className="flex items-center">
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        isActive ? "text-white" : "text-gray-500"
                      }`}
                    />
                    {item.name}
                  </div>
                  {item.badge && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-[#E8931A] text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-base-200">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-base-200 rounded-md"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <h1 className="ml-3 text-2xl font-semibold text-gray-900 lg:ml-0">
                Dashboard
              </h1>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-4">
              <button className="btn btn-sm btn-outline btn-primary hidden sm:inline-flex">
                Quick Action
              </button>
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="w-8 h-8 bg-gradient-to-r from-[#A25F97] to-[#E8931A] rounded-full flex items-center justify-center cursor-pointer"
                >
                  <span className="text-white font-medium text-sm">AD</span>
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                >
                  <li>
                    <Link href="/dashboard/profile">Profile</Link>
                  </li>
                  <li>
                    <Link href="/dashboard/settings">Settings</Link>
                  </li>
                  <li>
                    <Link href="/logout">Logout</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 pb-20 lg:pb-8">
          <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-base-200 lg:hidden z-30">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {navigation.slice(0, 5).map((item) => {
            const isActive = isActivePath(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200 relative
                  ${
                    isActive
                      ? "bg-[#90AC19] text-white"
                      : "text-gray-500 hover:text-[#90AC19] hover:bg-base-200"
                  }
                `}
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium truncate">
                  {item.name}
                </span>
                {item.badge && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-[#E8931A] text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
