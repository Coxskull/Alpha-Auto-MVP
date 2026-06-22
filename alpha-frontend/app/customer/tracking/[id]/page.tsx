"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getOrder } from "@/services/orders";
import { Order } from "@/types/order";

export default function TrackingPage() {
  const params = useParams();

  const id =
    typeof params.id === "string"
      ? params.id
      : "";

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (!id) return;

    async function load() {
      try {
        const data =
          await getOrder(id);

        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading...
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Order Not Found
      </main>
    );
  }

  const steps = [
    "pending",
    "supplier_assigned",
    "driver_assigned",
    "picked_up",
    "en_route",
    "delivered",
  ];

  const currentStep =
    steps.indexOf(order.status);

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-10">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-green-900 to-green-700 p-6">

        <h1 className="text-3xl font-bold">
          Order Tracking
        </h1>

        <p className="text-green-100">
          {order.orderNumber}
        </p>

      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-4">

        {/* STATUS CARD */}
        <div className="bg-slate-900 rounded-2xl p-6">

          <div className="flex items-center gap-4">

            <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center text-3xl">
              ✓
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                Your Order Is Active
              </h2>

              <p className="text-slate-400">
                Status: {order.status}
              </p>
            </div>

          </div>

          {/* PROGRESS BAR */}

          <div className="mt-8">

            <div className="flex justify-between">

              {[
                "Order",
                "Supplier",
                "Driver",
                "Pickup",
                "En Route",
                "Delivered",
              ].map((label, index) => (

                <div
                  key={label}
                  className="flex flex-col items-center flex-1"
                >
                  <div
                    className={`
                    w-10
                    h-10
                    rounded-full
                    flex
                    items-center
                    justify-center
                    text-sm
                    font-bold
                    ${
                      index <= currentStep
                        ? "bg-green-600"
                        : "bg-slate-700"
                    }
                    `}
                  >
                    ✓
                  </div>

                  <span className="text-xs mt-2 text-center">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <div className="h-2 bg-slate-700 rounded-full mt-4">

              <div
                className="h-2 bg-green-500 rounded-full"
                style={{
                  width: `${
                    ((currentStep + 1) /
                      steps.length) *
                    100
                  }%`,
                }}
              />

            </div>

          </div>

        </div>

        {/* DELIVERY INFO */}

        <div className="bg-slate-900 rounded-2xl p-6">

          <h3 className="font-bold text-xl mb-4">
            Delivery Information
          </h3>

          <div className="space-y-3">

            <div>
              <p className="text-slate-400">
                Customer
              </p>

              <p>{order.customerName}</p>
            </div>

            <div>
              <p className="text-slate-400">
                Pickup Address
              </p>

              <p>{order.pickupAddress}</p>
            </div>

            <div>
              <p className="text-slate-400">
                Delivery Address
              </p>

              <p>{order.deliveryAddress}</p>
            </div>

          </div>

        </div>

        {/* ASSIGNMENTS */}

        <div className="bg-slate-900 rounded-2xl p-6">

          <h3 className="font-bold text-xl mb-4">
            Delivery Team
          </h3>

          <div className="grid md:grid-cols-2 gap-4">

            <div className="bg-slate-800 rounded-xl p-4">
              <p className="text-slate-400">
                Supplier
              </p>

              <p className="font-semibold">
                {order.supplierName ??
                  "Waiting Assignment"}
              </p>
            </div>

            <div className="bg-slate-800 rounded-xl p-4">
              <p className="text-slate-400">
                Driver
              </p>

              <p className="font-semibold">
                {order.driverName ??
                  "Waiting Assignment"}
              </p>
            </div>

          </div>

        </div>

        {/* ORDER DETAILS */}

        <div className="bg-slate-900 rounded-2xl p-6">

          <h3 className="font-bold text-xl mb-4">
            Order Details
          </h3>

          <div className="space-y-2">

            <p>
              <strong>Item:</strong>{" "}
              {order.itemDescription}
            </p>

            <p>
              <strong>Zone:</strong>{" "}
              {order.zone}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {order.status}
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}