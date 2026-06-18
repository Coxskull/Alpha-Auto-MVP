"use client";

import {
  AlertTriangle,
  Clock3,
  Truck,
} from "lucide-react";

const escalations = [
  {
    id: "ESC-1001",
    issue: "Driver delayed at pickup",
    severity: "High",
    order: "ALPHA-1001",
    time: "12 mins ago",
  },
  {
    id: "ESC-1002",
    issue: "Supplier preparation delay",
    severity: "Medium",
    order: "ALPHA-1005",
    time: "28 mins ago",
  },
];

const severityStyles: Record<
  string,
  string
> = {
  High:
    "bg-red-500/10 text-red-400 border-red-500/20",

  Medium:
    "bg-orange-500/10 text-orange-400 border-orange-500/20",

  Low:
    "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

export default function EscalationPanel() {
  return (
    <div className="rounded-3xl bg-[#111827] border border-white/5 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertTriangle
            size={22}
            className="text-red-400"
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white">
            Escalation Center
          </h2>

          <p className="text-gray-400 text-sm mt-1">
            Operational issues requiring attention
          </p>
        </div>
      </div>

      {/* Escalations */}
      <div className="space-y-4">
        {escalations.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl bg-[#0B0F14] border border-white/5 p-5"
          >
            <div className="flex flex-col gap-4">
              {/* Top */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-white font-semibold">
                    {item.issue}
                  </h3>

                  <p className="text-gray-400 text-sm mt-1">
                    Order: {item.order}
                  </p>
                </div>

                <div
                  className={`px-3 py-1.5 rounded-full border text-xs font-semibold ${severityStyles[item.severity]}`}
                >
                  {item.severity}
                </div>
              </div>

              {/* Bottom */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-gray-400 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock3 size={14} />
                    {item.time}
                  </div>

                  <div className="flex items-center gap-2">
                    <Truck size={14} />
                    Dispatch Alert
                  </div>
                </div>

                <button className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all">
                  Resolve
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}