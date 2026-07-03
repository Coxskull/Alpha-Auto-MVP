import type { OrderStatus } from "@/types/dashboard";

type Props = {
  status: OrderStatus;
};

export default function StatusChip({ status }: Props) {
  const variants: Record<OrderStatus, string> = {
    payment_pending: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
    payment_paid: "bg-green-500/10 text-green-300 border-green-500/20",

    waiting_for_supplier:
      "bg-amber-500/10 text-amber-400 border-amber-500/20",
    supplier_assigned: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    supplier_accepted: "bg-sky-500/10 text-sky-400 border-sky-500/20",

    waiting_for_driver:
      "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    driver_assigned:
      "bg-purple-500/10 text-purple-400 border-purple-500/20",
    driver_accepted:
      "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",

    waiting_for_pickup:
      "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    picked_up: "bg-teal-500/10 text-teal-400 border-teal-500/20",

    en_route: "bg-orange-500/10 text-orange-400 border-orange-500/20",

    arrived_at_destination:
      "bg-pink-500/10 text-pink-400 border-pink-500/20",

    delivered: "bg-green-500/10 text-green-400 border-green-500/20",

    proof_uploaded:
      "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",

    settlement_pending:
      "bg-lime-500/10 text-lime-300 border-lime-500/20",

    ready_for_payout:
      "bg-lime-600/10 text-lime-200 border-lime-600/20",

    supplier_declined:
      "bg-red-500/10 text-red-400 border-red-500/20",

    driver_declined:
      "bg-red-500/10 text-red-400 border-red-500/20",

    supplier_unavailable:
      "bg-red-500/10 text-red-400 border-red-500/20",

    driver_unavailable:
      "bg-red-500/10 text-red-400 border-red-500/20",

    customer_cancelled:
      "bg-red-500/10 text-red-400 border-red-500/20",

    payment_failed:
      "bg-red-500/10 text-red-400 border-red-500/20",

    delivery_failed:
      "bg-red-500/10 text-red-400 border-red-500/20",

    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const labels: Record<OrderStatus, string> = {
    payment_pending: "Awaiting Payment",
    payment_paid: "Payment Paid",

    waiting_for_supplier: "Waiting for Supplier",
    supplier_assigned: "Supplier Assigned",
    supplier_accepted: "Supplier Accepted",

    waiting_for_driver: "Waiting for Driver",
    driver_assigned: "Driver Assigned",
    driver_accepted: "Driver Accepted",

    waiting_for_pickup: "Waiting for Pickup",
    picked_up: "Parts Picked Up",

    en_route: "Driver En Route",
    arrived_at_destination: "Arrived",

    delivered: "Delivered",
    proof_uploaded: "Proof Uploaded",

    settlement_pending: "Settlement Pending",
    ready_for_payout: "Ready for Payout",

    supplier_declined: "Supplier Declined",
    driver_declined: "Driver Declined",
    supplier_unavailable: "Supplier Unavailable",
    driver_unavailable: "Driver Unavailable",
    customer_cancelled: "Customer Cancelled",
    payment_failed: "Payment Failed",
    delivery_failed: "Delivery Failed",

    cancelled: "Cancelled",
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${variants[status]}`}
    >
      <div className="h-2 w-2 rounded-full bg-current animate-pulse" />
      {labels[status]}
    </div>
  );
}