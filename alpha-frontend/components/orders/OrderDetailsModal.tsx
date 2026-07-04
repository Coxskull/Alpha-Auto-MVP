"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";

import {
  Order,
  TimelineEvent,
} from "@/types/dashboard";

type Props = {
  open: boolean;
  onClose: () => void;
  order: Order | null;
};

const statusLabels: Record<string, string> = {
  pending: "Request Created",
  supplier_assigned: "Supplier Assigned",
  driver_assigned: "Driver Assigned",
  picked_up: "Picked Up",
  en_route: "En Route",
  delivered: "Delivered",
  proof_uploaded: "Delivery Proof Uploaded",
};

export default function OrderDetailsModal({
  open,
  onClose,
  order,
}: Props) {
  const [timeline, setTimeline] = useState<
    TimelineEvent[]
  >([]);

  const [loadingTimeline, setLoadingTimeline] =
    useState(false);

  useEffect(() => {
    if (!order) return;

    const loadTimeline = async () => {
      try {
        setLoadingTimeline(true);

        const response = await api.get(
          `/api/StatusHistory/${order.id}`
        );

        setTimeline(response.data);
      } catch (error) {
        console.error(
          "Failed loading timeline",
          error
        );
      } finally {
        setLoadingTimeline(false);
      }
    };

    loadTimeline();
  }, [order]);

  if (!open || !order) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="
          w-full
          max-w-4xl
          max-h-[90vh]
          overflow-y-auto
          bg-[#111827]
          rounded-3xl
          border
          border-white/10
          p-6
          md:p-8
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Request Details
            </h2>

            <p className="text-gray-400 text-sm mt-1">
              {order.orderNumber}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard
            label="Customer Information"
            value={order.customerName}
          />

          <InfoCard
            label="Current Status"
            value={order.status}
          />

          <InfoCard
            label="Assigned Supplier"
            value={
              order.supplierName ||
              "Not Assigned"
            }
          />

          <InfoCard
            label="Assigned Driver"
            value={
              order.driverName ||
              "Not Assigned"
            }
          />

          <InfoCard
            label="Pickup Address"
            value={order.pickupAddress}
          />

          <InfoCard
            label="Delivery Address"
            value={order.deliveryAddress}
          />

          <InfoCard
            label="Request Type"
            value={order.itemDescription}
          />

          <InfoCard
            label="Territory / Zone"
            value={order.zone}
          />

          <InfoCard
            label="Created Time"
            value={
              order.createdAt
                ? new Date(
                    order.createdAt
                  ).toLocaleString()
                : "N/A"
            }
          />

          <InfoCard
            label="Last Updated"
            value={
              order.updatedAt
                ? new Date(
                    order.updatedAt
                  ).toLocaleString()
                : "N/A"
            }
          />
        </div>

        {/* Description */}
        <div className="mt-6 rounded-2xl bg-[#0B0F14] border border-white/5 p-5">
          <p className="text-gray-400 text-sm mb-2">
            Request Description
          </p>

          <p className="text-white">
            {order.itemDescription}
          </p>
        </div>
{order.proofImageUrl && (
  <div className="mt-6 rounded-2xl bg-[#0B0F14] border border-white/5 p-5">
    <h3 className="text-white font-semibold text-lg mb-4">
      Delivery Proof
    </h3>

    <img
      src={`${process.env.NEXT_PUBLIC_API_URL}${order.proofImageUrl}`}
      alt="Delivery Proof"
      className="w-full max-w-xl rounded-2xl border border-white/10 object-cover"
    />

    {order.proofUploadedAt && (
      <p className="text-xs text-gray-400 mt-3">
        Uploaded:{" "}
        {new Date(order.proofUploadedAt).toLocaleString()}
      </p>
    )}
  </div>
)}
        {/* Timeline */}
        <div className="mt-6 rounded-2xl bg-[#0B0F14] border border-white/5 p-5">
          <h3 className="text-white font-semibold text-lg mb-5">
            Activity Timeline
          </h3>

          {loadingTimeline ? (
            <p className="text-gray-400">
              Loading timeline...
            </p>
          ) : timeline.length === 0 ? (
            <p className="text-gray-400">
              No timeline records found.
            </p>
          ) : (
            <div className="space-y-5">
              {timeline.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4"
                >
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-green-400" />

                    <div className="w-[2px] flex-1 bg-white/10 mt-1" />
                  </div>

                  <div>
                    <p className="text-white font-medium">
                      {statusLabels[
                        item.status
                      ] || item.status}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(
                        item.createdAt
                      ).toLocaleString()}
                    </p>

                    {item.notes && (
                      <p className="text-sm text-gray-500 mt-2">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="rounded-2xl bg-[#0B0F14] border border-white/5 p-4">
      <p className="text-xs uppercase tracking-wider text-gray-500">
        {label}
      </p>

      <p className="text-white font-medium mt-2 break-words">
        {value || "N/A"}
      </p>
    </div>
  );
}