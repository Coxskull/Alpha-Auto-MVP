import StatusCards from "@/components/dashboard/StatusCards";
import ActiveOrdersTable from "@/components/dashboard/ActiveOrdersTable";
import AvailabilityBoard from "@/components/providers/AvailabilityBoard";
import Link from "next/link";
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#0B0F14]">
      <div className="p-8 space-y-8">
        {/* Welcome */}
        <section className="rounded-3xl bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/10 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-green-400 font-semibold text-sm uppercase tracking-widest">
                Alpha Dispatch System
              </p>

              <h1 className="text-4xl font-bold text-white mt-3">
                Mission Control Dashboard
              </h1>

              <p className="text-gray-400 mt-4 max-w-2xl">
                Monitor logistics operations, supplier coordination,
                driver assignments, and delivery execution in real-time.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-black/30 border border-white/5 rounded-2xl px-6 py-4">
                <p className="text-gray-400 text-sm">
                  System Status
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse" />

                  <span className="text-white font-semibold">
                    Operational
                  </span>
                </div>
              </div>

              <div className="bg-black/30 border border-white/5 rounded-2xl px-6 py-4">
                <p className="text-gray-400 text-sm">
                  Auto Refresh
                </p>

                <p className="text-white font-semibold mt-2">
                  15s
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* KPI Cards */}
        <StatusCards />

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Orders */}
          <div className="xl:col-span-2">
            <div className="rounded-3xl bg-[#111827] border border-white/5 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Active Orders
                  </h2>

                  <p className="text-gray-400 text-sm mt-1">
                    Real-time dispatch operations
                  </p>
                </div>

                <Link
  href="/orders"
  className="bg-green-500 hover:bg-green-400 text-black font-semibold px-5 py-2.5 rounded-xl transition-all"
>
  View All
</Link>
              </div>

              <ActiveOrdersTable />
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-8">
            <div className="rounded-3xl bg-[#111827] border border-white/5 p-6">
              <AvailabilityBoard type={"suppliers"} />
            </div>

            <div className="rounded-3xl bg-[#111827] border border-white/5 p-6">
              <h2 className="text-xl font-bold text-white mb-5">
                Operational Insights
              </h2>

              <div className="space-y-4">
                <div className="bg-[#1F2937] rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">
                      Avg Delivery Time
                    </span>

                    <span className="text-white font-semibold">
                      34 mins
                    </span>
                  </div>
                </div>

                <div className="bg-[#1F2937] rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">
                      Supplier Response
                    </span>

                    <span className="text-green-400 font-semibold">
                      92%
                    </span>
                  </div>
                </div>

                <div className="bg-[#1F2937] rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">
                      Driver Availability
                    </span>

                    <span className="text-white font-semibold">
                      18 Online
                    </span>
                  </div>
                </div>

                <div className="bg-[#1F2937] rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">
                      Failed Deliveries
                    </span>

                    <span className="text-red-400 font-semibold">
                      2 Today
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}