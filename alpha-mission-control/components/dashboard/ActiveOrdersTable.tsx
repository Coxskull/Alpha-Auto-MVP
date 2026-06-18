"use client";

import { useEffect, useState } from "react";
import OrderDetailsModal from "../orders/OrderDetailsModal";
import api from "@/services/api";
import AddOrderModal from "../orders/AddOrderModal";
import { Driver, Order, OrderStatus, Supplier } from "@/types/dashboard";
import AssignDriverModal from "../orders/AssignDriverModal";
import AssignSupplierModal from "../orders/AssignSupplierModal";
import StatusChip from "../StatusChip";
import OrderTimeline from "../orders/OrderTimeline";
import {
  markPickedUp,
  markEnRoute,
  markDelivered,
} from "@/services/orderActions";
export default function ActiveOrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [popupMessage, setPopupMessage] =
  useState<string | null>(null);
  const [driverModalOpen, setDriverModalOpen] =
  useState(false);

const [supplierModalOpen, setSupplierModalOpen] =
  useState(false);
const [searchTerm, setSearchTerm] =
  useState("");

const [statusFilter, setStatusFilter] =
  useState("all");
const [selectedOrderId, setSelectedOrderId] =
  useState<string | null>(null);

const [drivers, setDrivers] =
  useState<Driver[]>([]);

const [suppliers, setSuppliers] =
  useState<Supplier[]>([]);
const [actionLoading, setActionLoading] =
  useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] =
  useState<Order | null>(null);
  const fetchOrders = async () => {
    try {
      const response = await api.get("/api/Orders");

      setOrders(response.data);
    } catch (error) {
      console.error(
        "Failed to fetch orders",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const loadOrders = async () => {
    await fetchOrders();
  };

  loadOrders();

  const interval = setInterval(() => {
    loadOrders();
  }, 15000);

  return () => clearInterval(interval);
}, []);

  if (loading) {
    return (
      <div className="text-gray-400">
        Loading orders...
      </div>
    );
  }
const handleAction = async (
  action: () => Promise<unknown>,
  orderId: string
) => {
  try {
    setActionLoading(orderId);

    await action();

    await fetchOrders();
  } catch (error: unknown) {
    console.error(error);

    const axiosError = error as {
      response?: {
        data?: string | { message?: string };
      };
      message?: string;
    };

    const errorMessage =
      typeof axiosError.response?.data === "string"
        ? axiosError.response.data
        : axiosError.response?.data?.message ||
          axiosError.message ||
          "Action failed";

    if (
      errorMessage.includes(
        "No available drivers"
      )
    ) {
      setPopupMessage(
        "🚚 No drivers are currently available."
      );
    } else if (
      errorMessage.includes(
        "No available suppliers"
      )
    ) {
      setPopupMessage(
        "🏭 No suppliers are currently available."
      );
    } else {
      setPopupMessage(errorMessage);
    }
  } finally {
    setActionLoading(null);
  }
};

const openDriverModal = async (
  orderId: string
) => {
  const response =
    await api.get(
      "/api/Drivers/available"
    );

  setDrivers(response.data);

  setSelectedOrderId(orderId);

  setDriverModalOpen(true);
};

const openSupplierModal = async (
  orderId: string
) => {
  try {
    console.log("Opening supplier modal");

    const response =
      await api.get(
        "/api/Suppliers/available"
      );

    console.log(
      "Suppliers:",
      response.data
    );

    setSuppliers(response.data);

    setSelectedOrderId(orderId);

    setSupplierModalOpen(true);
  } catch (error) {
    console.error(
      "Supplier API failed:",
      error
    );

    setPopupMessage(
      "Unable to load suppliers."
    );
  }
};

const assignSelectedDriver = async (
  driverId: string
) => {
  await api.post(
    `/api/Orders/${selectedOrderId}/assign-driver/${driverId}`
  );

  setDriverModalOpen(false);

  fetchOrders();
};

const assignSelectedSupplier = async (
  supplierId: string
) => {
  await api.post(
    `/api/Orders/${selectedOrderId}/assign-supplier/${supplierId}`
  );

  setSupplierModalOpen(false);

  fetchOrders();
};

const filteredOrders = orders.filter(
  (order) => {
    const search =
      searchTerm.toLowerCase();

    const matchesSearch = [
  order.orderNumber,
  order.customerName,
  order.supplierName ?? "",
  order.driverName ?? "",
]
  .join(" ")
  .toLowerCase()
  .includes(search);

    const matchesStatus =
      statusFilter === "all"
        ? true
        : order.status ===
          statusFilter;

    return (
      matchesSearch &&
      matchesStatus
    );
  }
);
   return (
  <div className="space-y-5">

    {/* Header */}
    <div className="space-y-4">

      <div
        className="
          flex
          flex-col
          sm:flex-row
          sm:items-center
          sm:justify-between
          gap-4
        "
      >
        <h2 className="text-2xl font-bold text-white">
          Active Orders
        </h2>

        <button
          onClick={() =>
            setShowAddModal(true)
          }
          className="
            w-full
            sm:w-auto
            bg-green-500
            hover:bg-green-400
            text-black
            font-semibold
            px-5
            py-3
            rounded-xl
          "
        >
          + Add Order
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col lg:flex-row gap-4">

        <input
          type="text"
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(
              e.target.value
            )
          }
          placeholder="Search Order ID, Customer, Supplier, Driver..."
          className="
            flex-1
            bg-[#111827]
            border
            border-white/10
            rounded-2xl
            px-4
            py-3
            text-white
            placeholder:text-gray-500
            outline-none
            focus:border-green-500
          "
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
          className="
            bg-[#111827]
            border
            border-white/10
            rounded-2xl
            px-4
            py-3
            text-white
          "
        >
          <option value="all">
            All Statuses
          </option>

          <option value="pending">
            Pending
          </option>

          <option value="supplier_assigned">
            Supplier Assigned
          </option>
<option value="supplier_accepted">
  Supplier Accepted
</option>

<option value="ready_for_pickup">
  Ready For Pickup
</option>
          <option value="driver_assigned">
            Driver Assigned
          </option>

          <option value="picked_up">
            Picked Up
          </option>

          <option value="en_route">
            En Route
          </option>

          <option value="delivered">
            Delivered
          </option>
        </select>

      </div>

      <p className="text-sm text-gray-400">
        Showing
        <span className="mx-1 text-white font-semibold">
          {filteredOrders.length}
        </span>
        requests
      </p>

    </div>

    {/* Empty State */}
    {filteredOrders.length === 0 && (
      <div
        className="
          rounded-3xl
          border
          border-white/10
          bg-[#111827]
          p-10
          text-center
        "
      >
        <p className="text-gray-400">
          No matching requests found.
        </p>
      </div>
    )}
{filteredOrders.length === 0 && (
  <div
    className="
      rounded-3xl
      border
      border-white/10
      bg-[#111827]
      p-10
      text-center
    "
  >
    <p className="text-gray-400">
      No matching requests found.
    </p>
  </div>
)}

{filteredOrders.map((order) => (
  <div
    key={order.id}
    className="
      rounded-3xl
      border
      border-white/5
      bg-[#0B0F14]
      p-6
      hover:border-green-500/20
      transition-all
    "
  >
          {/* Header */}
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="
text-lg
sm:text-xl
font-bold
text-white
break-all
">
                  {order.orderNumber}
                </h3>

                <StatusChip
                  status={order.status as OrderStatus}
                />
              </div>

              <p className="text-gray-400 text-sm mt-2">
                Customer:{" "}
                {order.customerName}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-[#111827] px-4 py-2 rounded-xl border border-white/5">
                <p className="text-xs text-gray-500">
                  Status
                </p>

               <p className="text-sm font-semibold text-white mt-1">
  {order.status}
</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1
sm:grid-cols-2
xl:grid-cols-4 gap-5 mt-6">
            <div className="rounded-2xl bg-[#111827] p-4 border border-white/5">
              <p className="text-xs uppercase tracking-widest text-gray-500">
                Supplier
              </p>

              <p className="text-white font-semibold mt-2">
                {order.supplierName ||
                  "Not Assigned"}
              </p>
            </div>

            <div className="rounded-2xl bg-[#111827] p-4 border border-white/5">
              <p className="text-xs uppercase tracking-widest text-gray-500">
                Driver
              </p>

              <p className="text-white font-semibold mt-2">
                {order.driverName ||
                  "Not Assigned"}
              </p>
            </div>

            <div className="rounded-2xl bg-[#111827] p-4 border border-white/5">
              <p className="text-xs uppercase tracking-widest text-gray-500">
                Pickup
              </p>

              <p className="text-white font-semibold mt-2">
                {order.pickupAddress}
              </p>
            </div>

            <div className="rounded-2xl bg-[#111827] p-4 border border-white/5">
              <p className="text-xs uppercase tracking-widest text-gray-500">
                Delivery
              </p>

              <p className="text-white font-semibold mt-2">
                {order.deliveryAddress}
              </p>
            </div>
          </div>

          {/* Timeline */}
<div className="mt-8">

  {(() => {
   const currentStep = {
  pending: 0,
  supplier_assigned: 1,
  supplier_accepted: 2,
  ready_for_pickup: 3,
  driver_assigned: 4,
  picked_up: 5,
  en_route: 6,
  delivered: 7,
  cancelled: -1,
}[order.status] ?? 0;

    console.log(
      "ORDER STATUS:",
      order.orderNumber,
      order.status,
      "CURRENT STEP:",
      currentStep
    );

    return (
      <OrderTimeline
        steps={[
  { label: "Pending", completed: currentStep >= 0 },
  { label: "Assigned", completed: currentStep >= 1 },
  { label: "Accepted", completed: currentStep >= 2 },
  { label: "Ready", completed: currentStep >= 3 },
  { label: "Driver", completed: currentStep >= 4 },
  { label: "Pickup", completed: currentStep >= 5 },
  { label: "Route", completed: currentStep >= 6 },
  { label: "Delivered", completed: currentStep >= 7 },
]}
      />
    );
  })()}
</div>
          {/* Actions */}
<div className="
  grid
  grid-cols-2
  md:grid-cols-3
  xl:flex
  gap-3
  mt-8
">
  {/* View */}
  <button
  onClick={() =>
    setSelectedOrder(order)
  }
  className="
    w-full
    xl:w-auto
    bg-green-500
    hover:bg-green-400
    text-black
    font-semibold
    px-5
    py-2.5
    rounded-xl
  "
>
  View Details
</button>

  {/* Assign Driver */}
  <button
   onClick={() =>
  openDriverModal(order.id)
}
    disabled={
  actionLoading === order.id ||
  order.status !== "ready_for_pickup"
}
    className={`
px-5 py-2.5 rounded-xl transition-all
${
  order.status !== "ready_for_pickup"
    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
    : "bg-[#111827] hover:bg-[#1F2937] border border-white/5 text-white"
}
`}
  >
    {actionLoading === order.id
      ? "Assigning..."
      : "Assign Driver"}
  </button>

  {/* Assign Supplier */}
  <button
    onClick={() =>
  openSupplierModal(order.id)
}
    disabled={
  actionLoading === order.id ||
  order.status !== "pending"
}
    className={`
px-5 py-2.5 rounded-xl transition-all
${
  order.status !== "pending"
    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
    : "bg-[#111827] hover:bg-[#1F2937] border border-white/5 text-white"
}
`}
  >
    {actionLoading === order.id
      ? "Assigning..."
      : "Assign Supplier"}
  </button>

  {/* picked_up */}
  <button
    onClick={() =>
      handleAction(
        () => markPickedUp(order.id),
        order.id
      )
    }
    disabled={
  actionLoading === order.id ||
  order.status !== "driver_assigned"
}
    className={`
px-5 py-2.5 rounded-xl transition-all
${
  order.status !== "driver_assigned"
    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
    : "bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400"
}
`}
  >
    picked_up
  </button>

  {/* en_route */}
  <button
    onClick={() =>
      handleAction(
        () => markEnRoute(order.id),
        order.id
      )
    }
    disabled={
  actionLoading === order.id ||
  order.status !== "picked_up"
}
    className={`
px-5 py-2.5 rounded-xl transition-all
${
  order.status !== "picked_up"
    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
    : "bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400"
}
`}
  >
    en_route
  </button>

  {/* delivered */}
  <button
    onClick={() =>
      handleAction(
        () => markDelivered(order.id),
        order.id
      )
    }
    disabled={
  actionLoading === order.id ||
  order.status !== "en_route"
}
    className={`
px-5 py-2.5 rounded-xl transition-all
${
  order.status !== "en_route"
    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
    : "bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400"
}
`}
  >
    delivered
  </button>
</div>
        </div>
      ))}
      <AssignDriverModal
  open={driverModalOpen}
  drivers={drivers}
  territory={selectedOrder?.zone ?? ""}
  onClose={() => setDriverModalOpen(false)}
  onAssign={assignSelectedDriver}
/>

<AssignSupplierModal
  open={supplierModalOpen}
  suppliers={suppliers}
  territory={selectedOrder?.zone ?? ""}
  onClose={() => setSupplierModalOpen(false)}
  onAssign={assignSelectedSupplier}
/>
      <OrderDetailsModal
  open={selectedOrder !== null}
  order={selectedOrder}
  onClose={() =>
    setSelectedOrder(null)
  }
/>
<AddOrderModal
  open={showAddModal}
  onClose={() => setShowAddModal(false)}
  onCreated={fetchOrders}
/>
{popupMessage && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div
  className="
    bg-[#111827]
    border
    border-white/10
    rounded-2xl
    p-6
    w-full
    max-w-md
    mx-4
  "
>
      <h3 className="text-xl font-bold text-white mb-3">
        Assignment Failed
      </h3>

      <p className="text-gray-300">
        {popupMessage}
      </p>

      <div className="flex justify-end mt-6">
        <button
          onClick={() =>
            setPopupMessage(null)
          }
          className="
w-full
xl:w-auto
bg-green-500
hover:bg-green-400
text-black
font-semibold
px-5
py-2.5
rounded-xl"
        >
          OK
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}