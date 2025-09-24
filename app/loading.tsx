import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      {/* Animated Logo */}
      <div className="relative">
        {/* Pulsing background circle */}
        <div className="absolute inset-0 bg-[#90AC19]/20 rounded-full animate-ping"></div>
        <div className="absolute inset-0 bg-[#90AC19]/10 rounded-full animate-pulse"></div>

        {/* Logo container with bounce animation */}
        <div className="relative bg-white rounded-full p-6">
          <Image
            src="/parentalpalLOGO.png"
            alt="PARENTALPAL Loading"
            width={120}
            height={120}
            className="w-24 h-24 object-contain animate-spin-slow"
            priority
          />
        </div>
      </div>

      {/* Loading dots animation */}
      <div className="flex space-x-1 mt-6">
        <div className="w-3 h-3 bg-[#90AC19] rounded-full animate-bounce"></div>
        <div className="w-3 h-3 bg-[#E8931A] rounded-full animate-bounce [animation-delay:0.1s]"></div>
        <div className="w-3 h-3 bg-[#A25F97] rounded-full animate-bounce [animation-delay:0.2s]"></div>
        <div className="w-3 h-3 bg-[#FFEACF] border border-gray-300 rounded-full animate-bounce [animation-delay:0.3s]"></div>
      </div>
    </div>
  );
}
