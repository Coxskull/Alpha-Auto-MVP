"use client";

import { useEffect, useState } from "react";
import ActiveOrdersTable from "@/components/dashboard/ActiveOrdersTable";
import ServiceRequestsTable from "@/components/dashboard/ServiceRequestsTable";
import FinancialOverviewCards from "@/components/dashboard/FinancialOverviewCards";
import { getMissionControlOverview } from "@/services/dashboard";
import type { MissionControlOverview } from "@/types/serviceRequest";

export default function MissionControlDashboardPage() {
  const [overview, setOverview] = useState<MissionControlOverview | null>(null);

  async function loadOverview() {
    const data = await getMissionControlOverview();
    setOverview(data);
  }

  useEffect(() => {
    let active = true;

    async function load() {
      const data = await getMissionControlOverview();

      if (!active) return;

      setOverview(data);
    }

    void load();

    const timer = window.setInterval(() => {
      void load();
    }, 15000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#0B0F14] p-6 text-white space-y-8">
      <section>
        <p className="text-green-400 font-semibold uppercase tracking-wider">
          Alpha Mission Control
        </p>

        <h1 className="text-3xl font-bold mt-2">
          Operations Dashboard
        </h1>

        <p className="text-gray-400 mt-2">
          Parts orders and mechanic service requests are now separated.
        </p>
      </section>

      <FinancialOverviewCards data={overview} />

      <section className="rounded-3xl bg-[#111827] border border-white/10 p-5">
        <h2 className="text-xl font-bold">
          Mechanic Service Requests
        </h2>

        <p className="text-gray-400 text-sm mt-1 mb-5">
          Customer mechanic jobs, provider assignment, mechanic assignment,
          parts request, and driver dispatch.
        </p>

        <ServiceRequestsTable onUpdated={loadOverview} />
      </section>

      <section className="rounded-3xl bg-[#111827] border border-white/10 p-5">
        <h2 className="text-xl font-bold">
          Parts Orders
        </h2>

        <p className="text-gray-400 text-sm mt-1 mb-5">
          Customer parts orders, supplier fulfillment, and driver delivery.
        </p>

        <ActiveOrdersTable />
      </section>
    </main>
  );
}