"use client";

import {
  Activity,
  Wifi,
  Radar,
  Clock3,
} from "lucide-react";

export default function LiveMonitoring() {
  return (
    <div className="rounded-3xl bg-[#111827] border border-white/5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Live Monitoring
          </h2>

          <p className="text-gray-400 text-sm mt-1">
            Real-time dispatch visibility
          </p>
        </div>

        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-xl">
          <Wifi
            size={15}
            className="text-green-400"
          />

          <span className="text-green-400 text-sm font-semibold">
            CONNECTED
          </span>
        </div>
      </div>

      {/* Monitoring Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl bg-[#0B0F14] border border-white/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">
                Active Tracking
              </p>

              <h3 className="text-3xl font-bold text-white mt-3">
                42
              </h3>
            </div>

            <div className="h-14 w-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <Radar
                size={24}
                className="text-green-400"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#0B0F14] border border-white/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">
                Avg Dispatch Time
              </p>

              <h3 className="text-3xl font-bold text-white mt-3">
                4.8m
              </h3>
            </div>

            <div className="h-14 w-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <Clock3
                size={24}
                className="text-green-400"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#0B0F14] border border-white/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">
                System Activity
              </p>

              <h3 className="text-3xl font-bold text-white mt-3">
                Stable
              </h3>
            </div>

            <div className="h-14 w-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <Activity
                size={24}
                className="text-green-400"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#0B0F14] border border-white/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">
                Connected Fleets
              </p>

              <h3 className="text-3xl font-bold text-white mt-3">
                18
              </h3>
            </div>

            <div className="h-14 w-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <Wifi
                size={24}
                className="text-green-400"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}