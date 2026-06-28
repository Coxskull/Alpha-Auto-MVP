"use client";

import type { MissionControlOverview } from "@/types/serviceRequest";

export default function FinancialOverviewCards({
  data,
}: {
  data: MissionControlOverview | null;
}) {
  if (!data) return null;

  const financials = data.financials;
  const service = data.serviceRequests;

  const cards = [
    { label: "Active Requests", value: service.active },
    { label: "Completed Today", value: service.completedToday },
    { label: "Gross Revenue", value: `$${financials.grossRevenue}` },
    { label: "Alpha Revenue", value: `$${financials.alphaRevenue}` },
    { label: "Provider Payouts", value: `$${financials.providerPayouts}` },
    { label: "Mechanic Payouts", value: `$${financials.mechanicPayouts}` },
    { label: "Driver Payouts", value: `$${financials.driverPayouts}` },
    { label: "Pending Review", value: financials.pendingReview },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl bg-[#111827] border border-white/10 p-5"
        >
          <p className="text-gray-400 text-sm">{card.label}</p>
          <p className="text-white text-2xl font-bold mt-2">{card.value}</p>
        </div>
      ))}
    </div>
  );
}