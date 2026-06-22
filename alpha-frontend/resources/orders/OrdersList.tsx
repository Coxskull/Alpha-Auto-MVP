"use client";

import ActiveOrdersTable from "@/components/dashboard/ActiveOrdersTable";

export default function OrdersList() {
  return (
    <div className="p-8 bg-[#070B11] min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">
          Orders
        </h1>

        <p className="text-gray-400 mt-2">
          Full operational order management
        </p>
      </div>

      <ActiveOrdersTable />
    </div>
  );
}