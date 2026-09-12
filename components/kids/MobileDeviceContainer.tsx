"use client";

import React from "react";
import { NieceId } from "@/types/reading";
import { Wifi, BatteryMedium } from "lucide-react";

interface Props {
  deviceMode: "phone" | "tablet" | "full";
  activeNieceId: NieceId;
  children: React.ReactNode;
}

export function MobileDeviceContainer({
  deviceMode,
  activeNieceId,
  children,
}: Props) {
  // Fun border theming based on which niece is reading
  const caseBorderColor =
    activeNieceId === "ellee"
      ? "border-pink-400 ring-pink-200"
      : activeNieceId === "kaylee"
      ? "border-teal-400 ring-teal-200"
      : "border-purple-400 ring-purple-200";

  // Full screen mode: fills standard responsive layout
  if (deviceMode === "full") {
    return (
      <div className="w-full min-h-[100dvh] h-[100dvh] flex flex-col bg-amber-50/40 overflow-hidden">
        {children}
      </div>
    );
  }

  const isPhone = deviceMode === "phone";

  return (
    // Outer wrapper: on mobile screens it sits 100% flush with zero outer margin/padding
    // On desktop, it centers a sleek kids mobile device shell
    <div className="w-full min-h-[100dvh] h-[100dvh] flex items-center justify-center p-0 sm:p-4 md:p-6 bg-gradient-to-br from-amber-100 via-pink-100 to-sky-100 overflow-hidden">
      <div
        id="kids-mobile-device-shell"
        className={`w-full h-full sm:h-[min(95vh,880px)] flex flex-col bg-amber-50/40 transition-all duration-300 relative overflow-hidden ${
          isPhone ? "sm:max-w-[430px]" : "sm:max-w-[768px]"
        } rounded-none sm:rounded-[36px] border-0 sm:border-4 ${caseBorderColor} sm:ring-4 sm:shadow-2xl`}
      >
        {/* Mobile Device Top Status Bar (Subtle & compact) */}
        <div className="flex-none bg-white/95 border-b border-amber-200/80 px-4 py-1.5 flex items-center justify-between text-[11px] font-extrabold text-gray-500 select-none">
          <span className="font-mono">9:41 AM</span>

          {/* Speaker pill notch */}
          <div className="flex items-center gap-1.5 px-3 py-0.5 bg-gray-100 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            <span className="w-8 h-1 rounded-full bg-gray-300" />
          </div>

          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-gray-600" />
            <BatteryMedium className="w-4 h-4 text-emerald-600" />
          </div>
        </div>

        {/* Inner App Content: flex-1 column containing Header, Scrollable Main, and Bottom Nav */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {children}
        </div>

        {/* Mobile Device Bottom Home Indicator (Only shown on desktop framed view) */}
        <div className="hidden sm:flex flex-none bg-white/90 border-t border-amber-200/60 py-1.5 items-center justify-center select-none">
          <div className="w-24 h-1 rounded-full bg-gray-400/80" />
        </div>
      </div>
    </div>
  );
}
