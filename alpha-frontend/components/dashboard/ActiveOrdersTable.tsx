import StatusCards from "@/components/dashboard/StatusCards";
import ActiveOrdersTable from "@/components/dashboard/ActiveOrdersTable";
import AvailabilityBoard from "@/components/providers/AvailabilityBoard";
import Link from "next/link";

const quickActions = [
  {
    title: "Orders",
    href: "/mission-control/orders",
    description: "Manage active orders",
  },
  {
    title: "Drivers",
    href: "/mission-control/drivers",
    description: "Driver availability",
  },
  {
    title: "Suppliers",
    href: "/mission-control/suppliers",
    description: "Supplier workload",
  },
  {
    title: "Mechanics",
    href: "/mission-control/mechanics",
    description: "Repair service team",
  },
  {
    title: "Service Requests",
    href: "/mission-control/service-requests",
    description: "On-site repair jobs",
  },
  {
    title: "Financials",
    href: "/mission-control/financials",
    description: "Revenue and payouts",
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#0B0F14] text-white">
      <div className="p-4 md:p-8 space-y-8">
        <section className="rounded-3xl bg-gradient-to-r from-emerald-500/15 via-green-500/10 to-cyan-500/10 border border-emerald-500/10 p-6 md:p-8">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
            <div>
              <p className="text-emerald-400 font-semibold text-sm uppercase tracking-widest">
                Alpha Auto Operations
              </p>

              <h1 className="text-3xl md:text-5xl font-black mt-3">
                Mission Control Dashboard
              </h1>

              <p className="text-gray-400 mt-4 max-w-3xl">
                Monitor customer orders, supplier fulfillment, driver dispatch,
                mechanic service requests, payments, and payouts in one command center.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/30 border border-white/10 rounded-2xl px-5 py-4">
                <p className="text-gray-400 text-sm">System</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold">Operational</span>
                </div>
              </div>

              <div className="bg-black/30 border border-white/10 rounded-2xl px-5 py-4">
                <p className="text-gray-400 text-sm">Auto Refresh</p>
                <p className="font-bold mt-2">15s</p>
              </div>

              <div className="bg-black/30 border border-white/10 rounded-2xl px-5 py-4">
                <p className="text-gray-400 text-sm">Currency</p>
                <p className="font-bold mt-2">USD / MXN</p>
              </div>

              <div className="bg-black/30 border border-white/10 rounded-2xl px-5 py-4">
                <p className="text-gray-400 text-sm">Mode</p>
                <p className="font-bold mt-2">Live Dispatch</p>
              </div>
            </div>
          </div>
        </section>

        <StatusCards />

        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-black">Control Modules</h2>
              <p className="text-gray-400 text-sm mt-1">
                Jump into each Alpha operations area.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
            {quickActions.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-3xl bg-[#111827] border border-white/10 p-5 hover:bg-[#172033] transition-all"
              >
                <h3 className="font-black">{item.title}</h3>
                <p className="text-gray-400 text-sm mt-2">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <div className="rounded-3xl bg-[#111827] border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black">Active Orders</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Parts orders and delivery lifecycle.
                  </p>
                </div>

                <Link
                  href="/mission-control/orders"
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-5 py-2.5 rounded-xl transition-all"
                >
                  View All
                </Link>
              </div>

              <ActiveOrdersTable />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/mission-control/service-requests"
                className="rounded-3xl bg-[#111827] border border-white/10 p-6 hover:bg-[#172033]"
              >
                <p className="text-gray-400 text-sm">Mechanic Queue</p>
                <h3 className="text-3xl font-black mt-3">Service Jobs</h3>
                <p className="text-emerald-400 mt-3 text-sm">
                  View repair requests →
                </p>
              </Link>

              <Link
                href="/mission-control/escalations"
                className="rounded-3xl bg-[#111827] border border-white/10 p-6 hover:bg-[#172033]"
              >
                <p className="text-gray-400 text-sm">Exceptions</p>
                <h3 className="text-3xl font-black mt-3">Escalations</h3>
                <p className="text-red-400 mt-3 text-sm">
                  Resolve issues →
                </p>
              </Link>

              <Link
                href="/mission-control/financials"
                className="rounded-3xl bg-[#111827] border border-white/10 p-6 hover:bg-[#172033]"
              >
                <p className="text-gray-400 text-sm">Revenue</p>
                <h3 className="text-3xl font-black mt-3">Financials</h3>
                <p className="text-yellow-400 mt-3 text-sm">
                  Review payouts →
                </p>
              </Link>
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-3xl bg-[#111827] border border-white/10 p-6">
              <AvailabilityBoard type="suppliers" />
            </div>

            <div className="rounded-3xl bg-[#111827] border border-white/10 p-6">
              <h2 className="text-xl font-black mb-5">
                Operational Insights
              </h2>

              <div className="space-y-4">
                {[
                  ["Avg Delivery Time", "34 mins", "text-white"],
                  ["Supplier Response", "92%", "text-emerald-400"],
                  ["Driver Availability", "18 Online", "text-white"],
                  ["Mechanic Availability", "7 Online", "text-cyan-400"],
                  ["Pending Payouts", "$1,245.00", "text-yellow-400"],
                  ["Failed Deliveries", "2 Today", "text-red-400"],
                ].map(([label, value, color]) => (
                  <div
                    key={label}
                    className="bg-[#1F2937] rounded-2xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">{label}</span>
                      <span className={`${color} font-bold`}>
                        {value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-[#111827] border border-white/10 p-6">
              <h2 className="text-xl font-black mb-5">
                Workflow Coverage
              </h2>

              <div className="space-y-3 text-sm">
                {[
                  "Customer ordering",
                  "Supplier fulfillment",
                  "Driver delivery",
                  "Mechanic service",
                  "Proof upload",
                  "Financial settlement",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between bg-[#1F2937] rounded-2xl p-3"
                  >
                    <span className="text-gray-300">{item}</span>
                    <span className="text-emerald-400 font-bold">Live</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}