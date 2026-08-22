"use client";

import { useCallback, useEffect, useState } from "react";

import { getMySupplierOrders } from "@/services/orders";

import type { ProviderOrder } from "@/types/order";


// ============================================================
// DASHBOARD
// ============================================================

export default function Dashboard() {
  const [orders, setOrders] = useState<ProviderOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // ============================================================
  // LOAD MY SUPPLIER ORDERS
  // ============================================================

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getMySupplierOrders();

      console.log(
        "[ProviderDashboard] My supplier orders:",
        data
      );

      // Handle either:
      //
      // [
      //   {...},
      //   {...}
      // ]
      //
      // or:
      //
      // {
      //   data: [...]
      // }

      let supplierOrders: ProviderOrder[] = [];

      if (Array.isArray(data)) {
        supplierOrders = data;
      } else if (
        data &&
        Array.isArray(data.data)
      ) {
        supplierOrders = data.data;
      }

      setOrders(supplierOrders);

    } catch (error) {
      console.error(
        "[ProviderDashboard] Failed to load orders:",
        error
      );

      setOrders([]);

      setError(
        "Unable to load your supplier orders."
      );
    } finally {
      setLoading(false);
    }
  }, []);


  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
  let cancelled = false;

  const timer = window.setTimeout(() => {
    if (!cancelled) {
      void loadOrders();
    }
  }, 0);

  return () => {
    cancelled = true;
    window.clearTimeout(timer);
  };
}, [loadOrders]);


useEffect(() => {
  const interval = window.setInterval(() => {
    void loadOrders();
  }, 15000);

  return () => {
    window.clearInterval(interval);
  };
}, [loadOrders]);

  // ============================================================
  // ORDER COUNTS
  // ============================================================

  const newOrders = orders.filter(
    (order) =>
      order.status === "supplier_assigned"
  ).length;


  const readyForPickup = orders.filter(
    (order) =>
      order.status === "ready_for_pickup"
  ).length;


  const activeDeliveries = orders.filter(
    (order) =>
      order.status === "driver_assigned" ||
      order.status === "driver_accepted" ||
      order.status === "picked_up" ||
      order.status === "en_route"
  ).length;


  const completedOrders = orders.filter(
    (order) =>
      order.status === "completed"
  ).length;


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="space-y-6">

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-400">
            Alpha Provider Panel
          </p>

          <h1 className="mt-1 text-3xl font-bold text-white">
            Provider Dashboard
          </h1>

          <p className="mt-2 text-gray-400">
            Loading your assigned orders...
          </p>
        </div>


        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-5">

          {[
            "New Orders",
            "Ready For Pickup",
            "Active Deliveries",
            "Completed",
            "Total Orders",
          ].map((label) => (
            <div
              key={label}
              className="animate-pulse rounded-xl border border-gray-700 bg-[#1f2937] p-6"
            >
              <div className="h-4 w-28 rounded bg-gray-700" />

              <div className="mt-4 h-10 w-16 rounded bg-gray-700" />
            </div>
          ))}

        </div>

      </div>
    );
  }


  // ============================================================
  // MAIN DASHBOARD
  // ============================================================

  return (
    <div className="space-y-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div>

        <p className="text-sm font-semibold uppercase tracking-wider text-orange-400">
          Alpha Provider Panel
        </p>

        <h1 className="mt-1 text-3xl font-bold text-white">
          Provider Dashboard
        </h1>

        <p className="mt-2 text-gray-400">
          View and manage only the orders assigned
          to your supplier account.
        </p>

      </div>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">

          <p className="font-semibold text-red-400">
            Dashboard Error
          </p>

          <p className="mt-1 text-sm text-red-300">
            {error}
          </p>

          <button
            type="button"
            onClick={() => void loadOrders()}
            className="mt-3 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400"
          >
            Retry
          </button>

        </div>
      )}


      {/* ======================================================
          STAT CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-5">

        {/* NEW ORDERS */}

        <DashboardCard
          title="New Orders"
          value={newOrders}
          valueClass="text-green-400"
        />


        {/* READY FOR PICKUP */}

        <DashboardCard
          title="Ready For Pickup"
          value={readyForPickup}
          valueClass="text-yellow-400"
        />


        {/* ACTIVE DELIVERIES */}

        <DashboardCard
          title="Active Deliveries"
          value={activeDeliveries}
          valueClass="text-blue-400"
        />


        {/* COMPLETED */}

        <DashboardCard
          title="Completed"
          value={completedOrders}
          valueClass="text-emerald-400"
        />


        {/* TOTAL */}

        <DashboardCard
          title="My Total Orders"
          value={orders.length}
          valueClass="text-white"
        />

      </div>


      {/* ======================================================
          ASSIGNED ORDERS
      ====================================================== */}

      <section className="rounded-xl border border-gray-700 bg-[#1f2937] p-6">

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

          <div>

            <h2 className="text-xl font-bold text-white">
              My Assigned Orders
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              These are the orders assigned to your
              supplier account.
            </p>

          </div>

          <button
            type="button"
            onClick={() => void loadOrders()}
            className="rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
          >
            Refresh
          </button>

        </div>


        {/* ====================================================
            NO ORDERS
        ==================================================== */}

        {orders.length === 0 ? (

          <div className="mt-6 rounded-xl border border-gray-700 bg-gray-900 p-8 text-center">

            <p className="text-gray-400">
              No orders are currently assigned to you.
            </p>

          </div>

        ) : (

          /* ==================================================
             ORDERS
             ================================================== */

          <div className="mt-6 overflow-x-auto">

            <table className="w-full min-w-[800px]">

              <thead>

                <tr className="border-b border-gray-700 text-left">

                  <th className="px-4 py-3 text-sm font-semibold text-gray-400">
                    Order
                  </th>

                  <th className="px-4 py-3 text-sm font-semibold text-gray-400">
                    Customer
                  </th>

                  <th className="px-4 py-3 text-sm font-semibold text-gray-400">
                    Items
                  </th>

                  <th className="px-4 py-3 text-sm font-semibold text-gray-400">
                    Status
                  </th>

                  <th className="px-4 py-3 text-sm font-semibold text-gray-400">
                    Driver
                  </th>

                </tr>

              </thead>


              <tbody>

                {orders.map((order) => (

                  <tr
                    key={order.id}
                    className="border-b border-gray-800 hover:bg-gray-800/50"
                  >

                    {/* ORDER */}

                    <td className="px-4 py-4">

                      <p className="font-semibold text-white">
                        {order.orderNumber ||
                          order.id}
                      </p>

                    </td>


                    {/* CUSTOMER */}

                    <td className="px-4 py-4 text-gray-300">

                      {order.customerName ||
                        "N/A"}

                    </td>


                    {/* ITEMS */}

                    <td className="max-w-xs px-4 py-4 text-gray-300">

                      {order.itemDescription ||
                        "N/A"}

                    </td>


                    {/* STATUS */}

                    <td className="px-4 py-4">

                      <StatusBadge
                        status={
                          order.status
                        }
                      />

                    </td>


                    {/* DRIVER */}

                    <td className="px-4 py-4 text-gray-300">

                      {order.driverName ||
                        "Not Assigned"}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>
  );
}


// ============================================================
// DASHBOARD CARD
// ============================================================

function DashboardCard({
  title,
  value,
  valueClass,
}: {
  title: string;
  value: number;
  valueClass: string;
}) {
  return (
    <div className="rounded-xl border border-gray-700 bg-[#1f2937] p-6">

      <h3 className="text-gray-300">
        {title}
      </h3>

      <p
        className={`mt-2 text-4xl font-bold ${valueClass}`}
      >
        {value}
      </p>

    </div>
  );
}


// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({
  status,
}: {
  status?: string;
}) {
  const formattedStatus =
    (status || "unknown")
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );

  let className =
    "border-gray-600 bg-gray-700 text-gray-300";

  switch (status) {

    case "supplier_assigned":
      className =
        "border-green-500/30 bg-green-500/10 text-green-400";
      break;

    case "ready_for_pickup":
      className =
        "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
      break;

    case "driver_assigned":
    case "driver_accepted":
      className =
        "border-blue-500/30 bg-blue-500/10 text-blue-400";
      break;

    case "picked_up":
    case "en_route":
      className =
        "border-purple-500/30 bg-purple-500/10 text-purple-400";
      break;

    case "delivered":
    case "proof_uploaded":
    case "completed":
      className =
        "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
      break;

  }

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${className}`}
    >
      {formattedStatus}
    </span>
  );
}