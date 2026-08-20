"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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


// ============================================================
// TYPES
// ============================================================

type StoredUser = {
  id?: string;
  Id?: string;
  userId?: string;
  UserId?: string;
  user?: {
    id?: string;
    Id?: string;
    userId?: string;
    UserId?: string;
  };
};

type Driver = {
  id?: string;
  Id?: string;
  userId?: string;
  UserId?: string;
};


// ============================================================
// HELPERS
// ============================================================

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}


function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null
  ) {
    const axiosError = error as {
      response?: {
        data?: unknown;
        status?: number;
      };
      message?: string;
    };

    const data = axiosError.response?.data;

    if (typeof data === "string") {
      return data;
    }

    if (
      typeof data === "object" &&
      data !== null
    ) {
      const responseData = data as {
        message?: string;
        title?: string;
        error?: string;
        detail?: string;
      };

      return (
        responseData.message ||
        responseData.title ||
        responseData.error ||
        responseData.detail ||
        axiosError.message ||
        "An unexpected API error occurred."
      );
    }

    return (
      axiosError.message ||
      "An unexpected API error occurred."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}


function getUserId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const possibleKeys = [
    "alpha_user",
    "user",
  ];

  for (const key of possibleKeys) {
    const stored = localStorage.getItem(key);

    if (!stored) {
      continue;
    }

    try {
      const parsed = JSON.parse(stored) as StoredUser;

      const userId =
        parsed.userId ||
        parsed.UserId ||
        parsed.id ||
        parsed.Id ||
        parsed.user?.userId ||
        parsed.user?.UserId ||
        parsed.user?.id ||
        parsed.user?.Id;

      if (userId) {
        return String(userId);
      }
    } catch {
      // Continue checking other storage keys.
    }
  }

  const fallbackKeys = [
    "userId",
    "id",
    "Id",
  ];

  for (const key of fallbackKeys) {
    const value = localStorage.getItem(key);

    if (value?.trim()) {
      return value.trim();
    }
  }

  return null;
}


// ============================================================
// COMPONENT
// ============================================================

export default function DriverDashboardPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] =
    useState<DriverDashboardStats | null>(null);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [userId, setUserId] =
    useState<string | null>(null);

  const [driverId, setDriverId] =
    useState<string | null>(null);

  const isFetching = useRef(false);


  // ============================================================
  // LOAD DRIVER ID
  // ============================================================

  const loadDriverId = useCallback(
    async (currentUserId: string) => {
      console.log(
        "[DriverDashboard] Looking up driver for user:",
        currentUserId
      );

      const response = await api.get<Driver>(
        `/api/Drivers/by-user/${currentUserId}`
      );

      console.log(
        "[DriverDashboard] Driver response:",
        response.data
      );

      const resolvedDriverId =
        response.data?.id ||
        response.data?.Id;

      if (!resolvedDriverId) {
        throw new Error(
          "Driver profile was found, but the driver ID is missing."
        );
      }

      return String(resolvedDriverId);
    },
    []
  );


  // ============================================================
  // LOAD DATA
  // ============================================================

  const fetchData = useCallback(
    async (showLoading = true) => {
      if (isFetching.current) {
        console.log(
          "[DriverDashboard] Fetch already running."
        );

        return;
      }

      isFetching.current = true;

      if (showLoading) {
        setLoading(true);
      }

      setError(null);

      try {
        // ------------------------------------------------------
        // GET USER ID
        // ------------------------------------------------------

        const currentUserId = getUserId();

        console.log(
          "[DriverDashboard] User ID:",
          currentUserId
        );

        if (!currentUserId) {
          throw new Error(
            "User ID not found. Please log out and log in again."
          );
        }

        setUserId(currentUserId);


        // ------------------------------------------------------
        // GET DRIVER
        // ------------------------------------------------------

        let currentDriverId: string;

        try {
          currentDriverId =
            await loadDriverId(currentUserId);

          setDriverId(currentDriverId);
        } catch (driverError) {
          console.error(
            "[DriverDashboard] Driver lookup failed:",
            driverError
          );

          throw new Error(
            `Unable to load driver profile: ${getErrorMessage(
              driverError
            )}`
          );
        }


        // ------------------------------------------------------
        // LOAD DASHBOARD DATA
        // ------------------------------------------------------

        const results =
          await Promise.allSettled([
            getMyDriverRequests(),

            getDriverDashboard(),

            api.get<Order[]>(
              "/api/Orders"
            ),
          ]);


        // ------------------------------------------------------
        // SERVICE REQUESTS
        // ------------------------------------------------------

        const requestResult =
          results[0];

        if (
          requestResult.status ===
          "fulfilled"
        ) {
          console.log(
            "[DriverDashboard] Service requests:",
            requestResult.value
          );

          setRequests(
            Array.isArray(
              requestResult.value
            )
              ? requestResult.value
              : []
          );
        } else {
          console.error(
            "[DriverDashboard] Service requests failed:",
            requestResult.reason
          );

          setRequests([]);
        }


        // ------------------------------------------------------
        // DRIVER STATS
        // ------------------------------------------------------

        const statsResult =
          results[1];

        if (
          statsResult.status ===
          "fulfilled"
        ) {
          console.log(
            "[DriverDashboard] Dashboard stats:",
            statsResult.value
          );

          setStats(
            statsResult.value
          );
        } else {
          console.error(
            "[DriverDashboard] Dashboard stats failed:",
            statsResult.reason
          );

          setStats(null);
        }


        // ------------------------------------------------------
        // ORDERS
        // ------------------------------------------------------

        const orderResult =
          results[2];

        if (
          orderResult.status ===
          "fulfilled"
        ) {
          const allOrders =
            Array.isArray(
              orderResult.value.data
            )
              ? orderResult.value.data
              : [];

          console.log(
            "[DriverDashboard] All orders:",
            allOrders
          );

          const myOrders =
            allOrders.filter(
              (order) => {
                const orderDriverId =
                  order.driverId;

                if (
                  !orderDriverId
                ) {
                  return false;
                }

                const sameDriver =
                  String(
                    orderDriverId
                  ).toLowerCase() ===
                  String(
                    currentDriverId
                  ).toLowerCase();

                if (!sameDriver) {
                  return false;
                }

                return [
                  "driver_assigned",
                  "driver_accepted",
                  "waiting_for_pickup",
                  "picked_up",
                  "en_route",
                  "delivered",
                  "proof_uploaded",
                ].includes(
                  order.status
                );
              }
            );

          console.log(
            "[DriverDashboard] My orders:",
            myOrders
          );

          setOrders(myOrders);
        } else {
          console.error(
            "[DriverDashboard] Orders failed:",
            orderResult.reason
          );

          setOrders([]);
        }


        // ------------------------------------------------------
        // CHECK PARTIAL FAILURES
        // ------------------------------------------------------

        const failedRequests =
          results.filter(
            (result) =>
              result.status ===
              "rejected"
          );

        if (
          failedRequests.length > 0
        ) {
          console.warn(
            `[DriverDashboard] ${failedRequests.length} secondary API request(s) failed.`
          );
        }
      } catch (requestError) {
        console.error(
          "[DriverDashboard] Dashboard loading failed:",
          requestError
        );

        setError(
          getErrorMessage(
            requestError
          )
        );
      } finally {
        // ======================================================
        // THIS IS THE IMPORTANT FIX
        // ======================================================

        setLoading(false);

        isFetching.current =
          false;
      }
    },
    [loadDriverId]
  );


  // ============================================================
  // INITIAL LOAD + AUTO REFRESH
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      if (cancelled) {
        return;
      }

      await fetchData(true);
    };

    void initialize();

    const interval =
      window.setInterval(() => {
        if (!cancelled) {
          void fetchData(false);
        }
      }, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [fetchData]);


  // ============================================================
  // RUN ACTION
  // ============================================================

  async function run(
    id: string,
    action: () => Promise<unknown>
  ) {
    try {
      setActionLoading(id);

      await action();

      await fetchData(false);
    } catch (requestError) {
      console.error(
        "[DriverDashboard] Action failed:",
        requestError
      );

      const message =
        getErrorMessage(
          requestError
        );

      alert(
        `Driver action failed.\n\n${message}`
      );
    } finally {
      setActionLoading(null);
    }
  }


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0B0F14] p-6 text-white">
        <div className="mx-auto max-w-6xl">

          <p className="text-orange-400 font-semibold uppercase tracking-wider">
            Alpha Driver Panel
          </p>

          <h1 className="text-3xl font-bold mt-2">
            Driver Dashboard
          </h1>

          <div className="mt-8 rounded-3xl border border-white/10 bg-[#111827] p-8">
            <div className="flex items-center gap-4">

              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-orange-400" />

              <div>
                <p className="font-semibold">
                  Loading driver dashboard...
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  Loading driver profile, orders,
                  service requests and earnings.
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>
    );
  }


  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <main className="min-h-screen bg-[#0B0F14] p-6 text-white space-y-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <section>
        <p className="text-orange-400 font-semibold uppercase tracking-wider">
          Alpha Driver Panel
        </p>

        <h1 className="text-3xl font-bold mt-2">
          Driver Dashboard
        </h1>

        <p className="text-gray-400 mt-2">
          Accept assigned orders and service delivery
          jobs, then update pickup and delivery progress.
        </p>

        <div className="mt-3 text-xs text-gray-500 space-y-1">
          <p>
            User ID:{" "}
            {userId || "Not available"}
          </p>

          <p>
            Driver ID:{" "}
            {driverId || "Not available"}
          </p>
        </div>
      </section>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <section className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">

          <p className="font-bold text-red-400">
            Dashboard Error
          </p>

          <p className="mt-2 text-sm text-red-300">
            {error}
          </p>

          <button
            onClick={() =>
              void fetchData(true)
            }
            className="mt-4 rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-400"
          >
            Retry
          </button>

        </section>
      )}


      {/* ======================================================
          STATS
      ====================================================== */}

      {stats && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">

          <Card
            label="Assigned"
            value={
              stats.jobs.assigned
            }
          />

          <Card
            label="Picked Up"
            value={
              stats.jobs.pickedUp
            }
          />

          <Card
            label="Delivered"
            value={
              stats.jobs.delivered
            }
          />

          <Card
            label="Completed"
            value={
              stats.jobs.completed
            }
          />

          <Card
            label="Earnings"
            value={`$${stats.financials.earnings}`}
          />

        </div>
      )}


      {/* ======================================================
          ORDER DELIVERIES
      ====================================================== */}

      <section className="rounded-3xl bg-[#111827] border border-white/10 p-5">

        <h2 className="text-xl font-bold">
          Assigned Order Deliveries
        </h2>

        <p className="text-gray-400 text-sm mt-1 mb-5">
          These are customer product orders assigned
          to you.
        </p>


        {orders.length === 0 ? (
          <Empty
            message="No assigned order deliveries yet."
          />
        ) : (

          <div className="space-y-5">

            {orders.map((order) => {

              const isBusy =
                actionLoading ===
                order.id;

              const canAccept =
                order.status ===
                "driver_assigned";

              const canPickup =
                order.status ===
                  "driver_accepted" ||
                order.status ===
                  "waiting_for_pickup";

              const canDeliver =
                order.status ===
                "en_route";


              return (
                <div
                  key={order.id}
                  className="rounded-3xl border border-white/5 bg-[#0B0F14] p-6 hover:border-orange-500/20 transition-all"
                >

                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                    <div>

                      <div className="flex flex-wrap items-center gap-3">

                        <h3 className="text-xl font-bold">
                          {order.orderNumber}
                        </h3>

                        <StatusPill
                          status={
                            order.status
                          }
                        />

                      </div>

                      <p className="text-gray-400 text-sm mt-2">
                        Customer:{" "}
                        {order.customerName}
                      </p>

                      <p className="text-gray-400 text-sm">
                        Items:{" "}
                        {order.itemDescription ||
                          "N/A"}
                      </p>

                    </div>


                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

                      <Info
                        label="Pickup"
                        value={
                          order.pickupAddress ||
                          "N/A"
                        }
                      />

                      <Info
                        label="Delivery"
                        value={
                          order.deliveryAddress ||
                          "N/A"
                        }
                      />

                    </div>

                  </div>


                  {/* ORDER STEPS */}

                  <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-4">

                    <Step
                      label="Assigned"
                      active={
                        order.status ===
                        "driver_assigned"
                      }
                      done={[
                        "driver_accepted",
                        "waiting_for_pickup",
                        "picked_up",
                        "en_route",
                        "delivered",
                        "proof_uploaded",
                      ].includes(
                        order.status
                      )}
                    />

                    <Step
                      label="Accepted"
                      active={
                        order.status ===
                        "driver_accepted"
                      }
                      done={[
                        "waiting_for_pickup",
                        "picked_up",
                        "en_route",
                        "delivered",
                        "proof_uploaded",
                      ].includes(
                        order.status
                      )}
                    />

                    <Step
                      label="Picked Up"
                      active={
                        order.status ===
                        "picked_up"
                      }
                      done={[
                        "en_route",
                        "delivered",
                        "proof_uploaded",
                      ].includes(
                        order.status
                      )}
                    />

                    <Step
                      label="Delivered"
                      active={
                        order.status ===
                        "delivered"
                      }
                      done={[
                        "delivered",
                        "proof_uploaded",
                      ].includes(
                        order.status
                      )}
                    />

                  </div>


                  {/* ORDER ACTIONS */}

                  <div className="flex flex-wrap gap-3 mt-6">

                    <button
                      disabled={
                        isBusy ||
                        !canAccept
                      }
                      onClick={() =>
                        run(
                          order.id,
                          () =>
                            driverAcceptOrder(
                              order.id
                            )
                        )
                      }
                      className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-black disabled:opacity-40"
                    >
                      {isBusy
                        ? "Working..."
                        : "Accept Order"}
                    </button>


                    <button
                      disabled={
                        isBusy ||
                        !canPickup
                      }
                      onClick={() =>
                        run(
                          order.id,
                          () =>
                            markPickedUp(
                              order.id
                            )
                        )
                      }
                      className="rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
                    >
                      {isBusy
                        ? "Working..."
                        : "Mark Picked Up"}
                    </button>


                    <button
                      disabled={
                        isBusy ||
                        !canDeliver
                      }
                      onClick={() =>
                        run(
                          order.id,
                          () =>
                            markDelivered(
                              order.id
                            )
                        )
                      }
                      className="rounded-xl bg-green-500 px-4 py-2.5 text-sm font-bold text-black disabled:opacity-40"
                    >
                      {isBusy
                        ? "Working..."
                        : "Mark Delivered"}
                    </button>


                    {order.status ===
                      "delivered" && (

                      <label className="cursor-pointer rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-black hover:bg-orange-400">

                        Upload Proof

                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          disabled={isBusy}
                          onChange={(event) => {

                            const file =
                              event.target.files?.[0];

                            if (!file) {
                              return;
                            }

                            void run(
                              order.id,
                              () =>
                                uploadDeliveryProof(
                                  order.id,
                                  file
                                )
                            );

                            event.target.value =
                              "";
                          }}
                        />

                      </label>

                    )}

                  </div>


                  {/* PROOF */}

                  {order.proofImageUrl && (

                    <div className="mt-5 rounded-2xl border border-white/10 bg-[#111827] p-4">

                      <p className="mb-3 text-sm font-bold text-orange-400">
                        Uploaded Delivery Proof
                      </p>

                      <img
                        src={
                          order.proofImageUrl
                        }
                        alt="Delivery Proof"
                        className="max-h-72 w-full rounded-xl border border-white/10 object-cover"
                      />

                      {order.proofUploadedAt && (
                        <p className="mt-2 text-xs text-gray-400">
                          Uploaded:{" "}
                          {new Date(
                            order.proofUploadedAt
                          ).toLocaleString()}
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


      {/* ======================================================
          SERVICE DELIVERIES
      ====================================================== */}

      <section className="rounded-3xl bg-[#111827] border border-white/10 p-5">

        <h2 className="text-xl font-bold">
          Assigned Service Deliveries
        </h2>

        <p className="text-gray-400 text-sm mt-1 mb-5">
          These are mechanic service jobs where
          parts delivery is assigned to you.
        </p>


        {requests.length === 0 ? (

          <Empty
            message="No assigned service deliveries yet."
          />

        ) : (

          <div className="space-y-5">

            {requests.map((request) => {

              const isBusy =
                actionLoading ===
                request.id;

              const canAccept =
                request.status ===
                "driver_assigned";

              const canPickUp =
                request.status ===
                "driver_accepted";

              const canDeliver =
                request.status ===
                "parts_picked_up";


              return (
                <div
                  key={request.id}
                  className="rounded-3xl border border-white/5 bg-[#0B0F14] p-6 hover:border-orange-500/20 transition-all"
                >

                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                    <div>

                      <div className="flex flex-wrap items-center gap-3">

                        <h3 className="text-xl font-bold">
                          {request.customerName}
                        </h3>

                        <StatusPill
                          status={
                            request.status
                          }
                        />

                      </div>

                      <p className="text-gray-400 text-sm mt-2">
                        Vehicle:{" "}
                        {request.vehicleInfo ||
                          "N/A"}
                      </p>

                      <p className="text-gray-400 text-sm">
                        Issue:{" "}
                        {request.issueDescription}
                      </p>

                    </div>


                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

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
                        value={
                          request.partsRequestNote ||
                          "Parts requested"
                        }
                      />

                    </div>

                  </div>


                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">

                    <Info
                      label="Pickup Zone"
                      value={
                        request.zone ||
                        "N/A"
                      }
                    />

                    <Info
                      label="Delivery Address"
                      value={
                        request.serviceAddress ||
                        "N/A"
                      }
                    />

                    <Info
                      label="Payment"
                      value={
                        request.paymentStatus ||
                        "unpaid"
                      }
                    />

                    <Info
                      label="Amount"
                      value={`${
                        request.finalAmount ||
                        0
                      }`}
                    />

                  </div>


                  <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-4">

                    <Step
                      label="Assigned"
                      active={
                        request.status ===
                        "driver_assigned"
                      }
                      done={[
                        "driver_accepted",
                        "parts_picked_up",
                        "parts_delivered",
                        "repair_started",
                        "proof_uploaded",
                        "completed",
                      ].includes(
                        request.status
                      )}
                    />

                    <Step
                      label="Accepted"
                      active={
                        request.status ===
                        "driver_accepted"
                      }
                      done={[
                        "parts_picked_up",
                        "parts_delivered",
                        "repair_started",
                        "proof_uploaded",
                        "completed",
                      ].includes(
                        request.status
                      )}
                    />

                    <Step
                      label="Parts Picked Up"
                      active={
                        request.status ===
                        "parts_picked_up"
                      }
                      done={[
                        "parts_delivered",
                        "repair_started",
                        "proof_uploaded",
                        "completed",
                      ].includes(
                        request.status
                      )}
                    />

                    <Step
                      label="Parts Delivered"
                      active={
                        request.status ===
                        "parts_delivered"
                      }
                      done={[
                        "repair_started",
                        "proof_uploaded",
                        "completed",
                      ].includes(
                        request.status
                      )}
                    />

                  </div>


                  <div className="flex flex-wrap gap-3 mt-6">

                    <button
                      disabled={
                        isBusy ||
                        !canAccept
                      }
                      onClick={() =>
                        run(
                          request.id,
                          () =>
                            driverAcceptServiceRequest(
                              request.id
                            )
                        )
                      }
                      className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-black disabled:opacity-40"
                    >
                      {isBusy
                        ? "Working..."
                        : "Accept Job"}
                    </button>


                    <button
                      disabled={
                        isBusy ||
                        !canPickUp
                      }
                      onClick={() =>
                        run(
                          request.id,
                          () =>
                            updateDriverStatus(
                              request.id,
                              "parts_picked_up"
                            )
                        )
                      }
                      className="rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
                    >
                      {isBusy
                        ? "Working..."
                        : "Mark Parts Picked Up"}
                    </button>


                    <button
                      disabled={
                        isBusy ||
                        !canDeliver
                      }
                      onClick={() =>
                        run(
                          request.id,
                          () =>
                            updateDriverStatus(
                              request.id,
                              "parts_delivered"
                            )
                        )
                      }
                      className="rounded-xl bg-green-500 px-4 py-2.5 text-sm font-bold text-black disabled:opacity-40"
                    >
                      {isBusy
                        ? "Working..."
                        : "Mark Parts Delivered"}
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


// ============================================================
// CARD
// ============================================================

function Card({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl bg-[#111827] border border-white/10 p-4">

      <p className="text-gray-400 text-sm">
        {label}
      </p>

      <p className="text-xl font-bold mt-1">
        {value}
      </p>

    </div>
  );
}


// ============================================================
// INFO
// ============================================================

function Info({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl bg-[#111827] p-4 border border-white/5">

      <p className="text-xs uppercase tracking-widest text-gray-500">
        {label}
      </p>

      <p className="text-white font-semibold mt-2 break-words">
        {value}
      </p>

    </div>
  );
}


// ============================================================
// STEP
// ============================================================

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


// ============================================================
// STATUS
// ============================================================

function StatusPill({
  status,
}: {
  status: string;
}) {
  return (
    <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-400 capitalize">
      {formatStatus(status)}
    </span>
  );
}


// ============================================================
// EMPTY
// ============================================================

function Empty({
  message,
}: {
  message: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0B0F14] p-8 text-center">

      <p className="text-gray-400">
        {message}
      </p>

    </div>
  );
}