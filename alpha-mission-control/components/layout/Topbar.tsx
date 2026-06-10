"use client";

import {
  Bell,
  Search,
  Globe,
} from "lucide-react";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-40 h-[80px] bg-[#111827]/95 backdrop-blur-xl border-b border-white/5">
      <div className="h-full px-8 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Alpha Mission Control
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              Real-time logistics dispatch and operations
            </p>
          </div>
        </div>

        {/* Center Search */}
        <div className="hidden lg:flex items-center w-[420px]">
          <div className="relative w-full">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              type="text"
              placeholder="Search orders, drivers, suppliers..."
              className="w-full bg-[#1F2937] border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-green-500 transition-all"
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {/* Environment */}
          <div className="hidden md:flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-xl">
            <Globe size={16} className="text-green-400" />

            <span className="text-sm font-medium text-green-400">
              LIVE
            </span>
          </div>

          {/* Notifications */}
          <button className="relative h-12 w-12 rounded-2xl bg-[#1F2937] border border-white/5 flex items-center justify-center text-gray-300 hover:text-white transition-all">
            <Bell size={18} />

            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-green-400" />
          </button>

          {/* Profile */}
          <div className="flex items-center gap-3 bg-[#1F2937] border border-white/5 px-3 py-2 rounded-2xl">
            <div className="h-10 w-10 rounded-xl bg-green-500 flex items-center justify-center text-black font-bold">
              D
            </div>

            <div className="hidden md:block">
              <p className="text-sm font-semibold text-white">
                Dispatcher
              </p>

              <p className="text-xs text-gray-400">
                Alpha Operations
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}