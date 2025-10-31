"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function PaymentCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference");
  const [status, setStatus] = useState<"pending" | "success" | "failed" | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      setLoading(false);
      return;
    }
    const verify = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
        });
        const data = await res.json();
        if (data.success && data.payment?.status === "success") {
          setStatus("success");
          toast.success("Payment successful!");
          // Optionally redirect to bookings/profile after delay
          setTimeout(() => router.push("/profile?tab=bookings"), 2000);
        } else {
          setStatus("failed");
          toast.error("Payment failed or not found.");
        }
      } catch (e) {
        setStatus("failed");
        toast.error("Error verifying payment.");
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [reference, router]);

  return (
    <div className="max-w-lg mx-auto py-20 text-center">
      {loading ? (
        <div className="text-lg text-[#A25F97] font-bold">
          Verifying payment...
        </div>
      ) : status === "success" ? (
        <div className="text-2xl text-[#90AC19] font-bold">
          Payment Successful!
        </div>
      ) : (
        <div className="text-2xl text-red-500 font-bold">Payment Failed</div>
      )}
    </div>
  );
}
