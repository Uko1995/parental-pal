"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";

export default function ToastRouteCleanup() {
  const pathname = usePathname();

  useEffect(() => {
    toast.dismiss();
  }, [pathname]);

  return null;
}
