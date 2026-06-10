"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export default function PageContent() {
  const searchParams = useSearchParams();
  const signout = searchParams.get("signout");

  useEffect(() => {
    if (signout === "success") {
      toast.success("You have been successfully signed out. Come back soon!");
      const url = new URL(window.location.href);
      url.searchParams.delete("signout");
      window.history.replaceState({}, "", url.pathname);
    }
  }, [signout]);

  return null;
}
