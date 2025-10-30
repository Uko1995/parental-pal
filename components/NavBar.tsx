"use client";

import { UserIcon } from "@heroicons/react/24/outline";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session, status } = useSession();
  // console.log("Session data:", session);

  interface NavItem {
    name: string;
    href: string;
  }

  const navItems: NavItem[] = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Services", href: "/services" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Determine if we should show transparent navbar (only on home page at top)
  const isTransparent = pathname === "/" && !isScrolled;

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isTransparent
          ? "bg-transparent backdrop-blur-sm"
          : "bg-white backdrop-blur-md shadow-md border-b border-gray-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="flex items-center transition-all duration-300"
            >
              <Image
                src="/parentalpalLOGO.png"
                alt="PARENTALPAL logo"
                width={200}
                height={50}
                className="h-15 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
                      isActive
                        ? isTransparent
                          ? "bg-white/20 text-white"
                          : "bg-[#90AC19]/10 text-[#90AC19]"
                        : isTransparent
                        ? "text-white/90 hover:text-white hover:bg-white/10"
                        : "text-gray-700 hover:text-[#90AC19] hover:bg-gray-50"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden md:block">
            {session?.user ? (
              <div className="ml-4 flex items-center md:ml-6">
                {session?.user?.image ? (
                  <Image
                    src={`${session?.user?.image}`}
                    alt={`${session?.user?.name}`}
                    width={30}
                    height={30}
                    className="rounded-full mr-2 object-cover"
                  />
                ) : (
                  <div
                    className={`rounded-full mr-2 p-1  ${
                      isScrolled ? "bg-black" : "bg-white"
                    }`}
                  >
                    <UserIcon
                      strokeWidth={2}
                      className={`w-5 h-5 ${
                        isScrolled ? "text-white" : "text-black"
                      }`}
                    />
                  </div>
                )}
                <Link
                  href={`/profile`}
                  className={`${
                    isTransparent ? "text-white" : "text-gray-800"
                  } mr-4 font-medium`}
                >
                  {session.user.name}
                </Link>
                <button
                  onClick={() =>
                    signOut({
                      callbackUrl: "/?signout=success",
                      redirect: true,
                    })
                  }
                  className="bg-[#90AC19] cursor-pointer hover:bg-[#7A9216] text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="ml-4 flex items-center md:ml-6">
                <Link
                  href={"/auth/signin"}
                  className={`bg-[#90AC19] hover:bg-[#7A9216] ${
                    status === "loading" ? "cursor-progress" : "cursor-pointer"
                  }  text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300`}
                >
                  {status === "loading" ? "Loading..." : "LOGIN"}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className={`inline-flex items-center justify-center p-2 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-inset ${
                isTransparent
                  ? "text-white hover:text-white hover:bg-white/10 focus:ring-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:ring-[#90AC19]"
              }`}
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div
            className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t ${
              isTransparent
                ? "bg-black/20 backdrop-blur-md border-white/20"
                : "bg-white border-gray-200"
            }`}
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
                    isActive
                      ? isTransparent
                        ? "bg-white/20 text-white"
                        : "bg-[#90AC19]/10 text-[#90AC19]"
                      : isTransparent
                      ? "text-white/90 hover:text-white hover:bg-white/10"
                      : "text-gray-700 hover:text-[#90AC19] hover:bg-gray-50"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}

            {/* Mobile Authentication Section */}
            <div className="border-t border-gray-200 pt-3 mt-3">
              {session?.user ? (
                <div className="space-y-2">
                  {/* User Profile Section */}
                  <div className="flex items-center px-3 py-2">
                    <div className="w-8 h-8 rounded-full mr-3">
                      {session.user?.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user?.name || "User"}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className={`rounded-full p-1 ${
                            isTransparent ? "bg-white" : "bg-gray-200"
                          }`}
                        >
                          <UserIcon
                            className={`w-6 h-6 ${
                              isTransparent ? "text-black" : "text-gray-600"
                            }`}
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          isTransparent ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {session.user.name}
                      </p>
                      <p
                        className={`text-xs ${
                          isTransparent ? "text-white/70" : "text-gray-500"
                        }`}
                      >
                        {session.user.email}
                      </p>
                    </div>
                  </div>

                  {/* Profile Link */}
                  <Link
                    href="/profile"
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
                      isTransparent
                        ? "text-white/90 hover:text-white hover:bg-white/10"
                        : "text-gray-700 hover:text-[#90AC19] hover:bg-gray-50"
                    }`}
                  >
                    Profile
                  </Link>

                  {/* Sign Out Button */}
                  <button
                    onClick={() =>
                      signOut({
                        callbackUrl: "/?signout=success",
                        redirect: true,
                      })
                    }
                    className={`w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
                      isTransparent
                        ? "text-white/90 hover:text-white hover:bg-white/10"
                        : "text-gray-700 hover:text-red-600 hover:bg-red-50"
                    }`}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className={`block px-3 py-2 rounded-md text-base font-medium text-center transition-colors duration-300 ${
                    status === "loading"
                      ? "cursor-progress bg-gray-300 text-gray-500"
                      : "bg-[#90AC19] hover:bg-[#7A9216] text-white"
                  }`}
                >
                  {status === "loading" ? "Loading..." : "Sign In"}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
