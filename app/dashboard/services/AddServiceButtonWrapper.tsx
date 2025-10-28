"use client";

import { useRouter } from "next/navigation";
import AddServiceButton from "./AddServiceButton";

export default function AddServiceButtonWrapper() {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  return <AddServiceButton onRefresh={handleRefresh} />;
}
