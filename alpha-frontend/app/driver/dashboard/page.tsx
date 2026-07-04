"use client";

import { useEffect, useState } from "react";
import {
  driverAcceptServiceRequest,
  getMyDriverRequests,
  updateDriverStatus,
} from "@/services/serviceRequests";
import {
  driverAcceptOrder,
  markDelivered,
  markPickedUp,
  uploadDeliveryProof,
} from "@/services/orderActions";
import { getDriverDashboard } from "@/services/dashboard";
import type {
  ServiceRequest,
  DriverDashboardStats,
} from "@/types/serviceRequest";
import type { Order } from "@/types/dashboard";
import api from "@/services/api";

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

export default function DriverDashboardPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DriverDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function fetchData() {
    const [requestData, statsData, orderResponse] = await Promise.all([
      getMyDriverRequests(),
      getDriverDashboard(),
      api.get<Order[]>("/api/Orders"),
    ]);

    const storedUser = localStorage.getItem("user");

    let userId: string | null = null;

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);

      userId =
        parsedUser?.userId ||
        parsedUser?.id ||
        parsedUser?.Id ||
        parsedUser?.user?.id ||
        null;
    }

    userId =
      userId ||
      localStorage.getItem("userId") ||
      localStorage.getItem("id") ||
      localStorage.getItem("Id");

    if (!userId) {
      throw new Error("User ID not found. Please login again.");
    }

    const driverResponse = await api.get(`/api/Drivers/by-user/${userId}`);
    const driverId = driverResponse.data.id;

    const myOrders = orderResponse.data.filter(
      (order) =>
        String(order.driverId).toLowerCase() === String(driverId).toLowerCase() &&
        [
          "driver_assigned",
          "driver_accepted",
          "waiting_for_pickup",
          "picked_up",
          "en_route",
          "delivered",
          "proof_uploaded",
        ].includes(order.status)
    );

    setRequests(requestData);
    setStats(statsData);
    setOrders(myOrders);
    setLoading(false);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchData();
    }, 0);

    const interval = window.setInterval(() => {
      void fetchData();
    }, 15000);

    return () => {
      clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, []);

  async function run(id: string, action: () => Promise<unknown>) {
    try {
      setActionLoading(id);
      await action();
      await fetchData();
    } catch (error) {
      console.error(error);
      alert("Driver action failed. Please check the current status.");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0B0F14] p-6 text-white">
        Loading driver dashboard...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0F14] p-6 text-white space-y-6">
      <section>
        <p className="text-orange-400 font-semibold uppercase tracking-wider">
          Alpha Driver Panel
        </p>

        <h1 className="text-3xl font-bold mt-2">Driver Dashboard</h1>

        <p className="text-gray-400 mt-2">
          Accept assigned orders and service delivery jobs, then update pickup
          and delivery progress.
        </p>
      </section>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card label="Assigned" value={stats.jobs.assigned} />
          <Card label="Picked Up" value={stats.jobs.pickedUp} />
          <Card label="Delivered" value={stats.jobs.delivered} />
          <Card label="Completed" value={stats.jobs.completed} />
          <Card label="Earnings" value={`$${stats.financials.earnings}`} />
        </div>
      )}

      <section className="rounded-3xl bg-[#111827] border border-white/10 p-5">
        <h2 className="text-xl font-bold">Assigned Order Deliveries</h2>

        <p className="text-gray-400 text-sm mt-1 mb-5">
          These are customer product orders assigned to you.
        </p>

        {orders.length === 0 ? (
          <Empty message="No assigned order deliveries yet." />
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const isBusy = actionLoading === order.id;

              const canAccept = order.status === "driver_assigned";
              const canPickup =
                order.status === "driver_accepted" ||
                order.status === "waiting_for_pickup";
              const canDeliver = order.status === "en_route";

              return (
                <div
                  key={order.id}
                  className="rounded-3xl border border-white/5 bg-[#0B0F14] p-6 hover:border-orange-500/20 transition-all"
                >
                  <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-bold">
                          {order.orderNumber}
                        </h3>

                        <StatusPill status={order.status} />
                      </div>

                      <p className="text-gray-400 text-sm mt-2">
                        Customer: {order.customerName}
                      </p>

                      <p className="text-gray-400 text-sm">
                        Items: {order.itemDescription || "N/A"}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Info label="Pickup" value={order.pickupAddress} />
                      <Info label="Delivery" value={order.deliveryAddress} />
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Step
                      label="Assigned"
                      active={order.status === "driver_assigned"}
                      done={[
                        "driver_accepted",
                        "waiting_for_pickup",
                        "picked_up",
                        "en_route",
                        "delivered",
                        "proof_uploaded",
                      ].includes(order.status)}
                    />

                    <Step
                      label="Accepted"
                      active={order.status === "driver_accepted"}
                      done={[
                        "waiting_for_pickup",
                        "picked_up",
                        "en_route",
                        "delivered",
                        "proof_uploaded",
                      ].includes(order.status)}
                    />

                    <Step
                      label="Picked Up"
                      active={order.status === "picked_up"}
                      done={[
                        "en_route",
                        "delivered",
                        "proof_uploaded",
                      ].includes(order.status)}
                    />

                    <Step
                      label="Delivered"
                      active={order.status === "delivered"}
                      done={["delivered", "proof_uploaded"].includes(order.status)}
                    />
                  </div>

                  <div className="flex flex-wrap gap-3 mt-6">
                    <button
                      disabled={isBusy || !canAccept}
                      onClick={() =>
                        run(order.id, () => driverAcceptOrder(order.id))
                      }
                      className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-black disabled:opacity-40"
                    >
                      {isBusy ? "Working..." : "Accept Order"}
                    </button>

                    <button
                      disabled={isBusy || !canPickup}
                      onClick={() =>
                        run(order.id, () => markPickedUp(order.id))
                      }
                      className="rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
                    >
                      {isBusy ? "Working..." : "Mark Picked Up"}
                    </button>

                    <button
                      disabled={isBusy || !canDeliver}
                      onClick={() =>
                        run(order.id, () => markDelivered(order.id))
                      }
                      className="rounded-xl bg-green-500 px-4 py-2.5 text-sm font-bold text-black disabled:opacity-40"
                    >
                      {isBusy ? "Working..." : "Mark Delivered"}
                    </button>

                    {order.status === "delivered" && (
                      <label className="cursor-pointer rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-black hover:bg-orange-400">
                        Upload Proof
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          disabled={isBusy}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            void run(order.id, () =>
                              uploadDeliveryProof(order.id, file)
                            );
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {order.proofImageUrl && (
                    <div className="mt-5 rounded-2xl border border-white/10 bg-[#111827] p-4">
                      <p className="mb-3 text-sm font-bold text-orange-400">
                        Uploaded Delivery Proof
                      </p>

                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}${order.proofImageUrl}`}
                        alt="Delivery Proof"
                        className="max-h-72 w-full rounded-xl border border-white/10 object-cover"
                      />

                      {order.proofUploadedAt && (
                        <p className="mt-2 text-xs text-gray-400">
                          Uploaded:{" "}
                          {new Date(order.proofUploadedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-3xl bg-[#111827] border border-white/10 p-5">
        <h2 className="text-xl font-bold">Assigned Service Deliveries</h2>

        <p className="text-gray-400 text-sm mt-1 mb-5">
          These are mechanic service jobs where parts delivery is assigned to
          you.
        </p>

        {requests.length === 0 ? (
          <Empty message="No assigned service deliveries yet." />
        ) : (
          <div className="space-y-5">
            {requests.map((request) => {
              const isBusy = actionLoading === request.id;

              const canAccept = request.status === "driver_assigned";
              const canPickUp = request.status === "driver_accepted";
              const canDeliver = request.status === "parts_picked_up";

              return (
                <div
                  key={request.id}
                  className="rounded-3xl border border-white/5 bg-[#0B0F14] p-6 hover:border-orange-500/20 transition-all"
                >
                  <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-bold">
                          {request.customerName}
                        </h3>

                        <StatusPill status={request.status} />
                      </div>

                      <p className="text-gray-400 text-sm mt-2">
                        Vehicle: {request.vehicleInfo || "N/A"}
                      </p>

                      <p className="text-gray-400 text-sm">
                        Issue: {request.issueDescription}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Info
                        label="Provider"
                        value={
                          request.providerName ||
                          request.providerId ||
                          "Not Assigned"
                        }
                      />

                      <Info
                        label="Mechanic"
                        value={
                          request.mechanicName ||
                          request.mechanicId ||
                          "Not Assigned"
                        }
                      />

                      <Info
                        label="Parts Status"
                        value={request.partsRequestNote || "Parts requested"}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
                    <Info label="Pickup Zone" value={request.zone || "N/A"} />
                    <Info
                      label="Delivery Address"
                      value={request.serviceAddress}
                    />
                    <Info
                      label="Payment"
                      value={request.paymentStatus || "unpaid"}
                    />
                    <Info label="Amount" value={`$${request.finalAmount || 0}`} />
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Step
                      label="Assigned"
                      active={request.status === "driver_assigned"}
                      done={[
                        "driver_accepted",
                        "parts_picked_up",
                        "parts_delivered",
                        "repair_started",
                        "proof_uploaded",
                        "completed",
                      ].includes(request.status)}
                    />

                    <Step
                      label="Accepted"
                      active={request.status === "driver_accepted"}
                      done={[
                        "parts_picked_up",
                        "parts_delivered",
                        "repair_started",
                        "proof_uploaded",
                        "completed",
                      ].includes(request.status)}
                    />

                    <Step
                      label="Parts Picked Up"
                      active={request.status === "parts_picked_up"}
                      done={[
                        "parts_delivered",
                        "repair_started",
                        "proof_uploaded",
                        "completed",
                      ].includes(request.status)}
                    />

                    <Step
                      label="Parts Delivered"
                      active={request.status === "parts_delivered"}
                      done={[
                        "repair_started",
                        "proof_uploaded",
                        "completed",
                      ].includes(request.status)}
                    />
                  </div>

                  <div className="flex flex-wrap gap-3 mt-6">
                    <button
                      disabled={isBusy || !canAccept}
                      onClick={() =>
                        run(request.id, () =>
                          driverAcceptServiceRequest(request.id)
                        )
                      }
                      className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-black disabled:opacity-40"
                    >
                      {isBusy ? "Working..." : "Accept Job"}
                    </button>

                    <button
                      disabled={isBusy || !canPickUp}
                      onClick={() =>
                        run(request.id, () =>
                          updateDriverStatus(request.id, "parts_picked_up")
                        )
                      }
                      className="rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
                    >
                      {isBusy ? "Working..." : "Mark Parts Picked Up"}
                    </button>

                    <button
                      disabled={isBusy || !canDeliver}
                      onClick={() =>
                        run(request.id, () =>
                          updateDriverStatus(request.id, "parts_delivered")
                        )
                      }
                      className="rounded-xl bg-green-500 px-4 py-2.5 text-sm font-bold text-black disabled:opacity-40"
                    >
                      {isBusy ? "Working..." : "Mark Parts Delivered"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-[#111827] border border-white/10 p-4">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-[#111827] p-4 border border-white/5">
      <p className="text-xs uppercase tracking-widest text-gray-500">
        {label}
      </p>

      <p className="text-white font-semibold mt-2">{value}</p>
    </div>
  );
}

function Step({
  label,
  active,
  done,
}: {
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 text-center text-xs font-bold ${
        done
          ? "border-green-500/30 bg-green-500/10 text-green-400"
          : active
          ? "border-orange-500/30 bg-orange-500/10 text-orange-400"
          : "border-white/10 bg-[#111827] text-gray-500"
      }`}
    >
      {label}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  return (
    <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-400 capitalize">
      {formatStatus(status)}
    </span>
  );
}

function Empty({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0B0F14] p-8 text-center">
      <p className="text-gray-400">{message}</p>
    </div>
  );
}