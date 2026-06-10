export type OrderStatus =
  | "Pending"
  | "Supplier Assigned"
  | "Driver Assigned"
  | "Picked Up"
  | "En Route"
  | "Delivered"
  | "Cancelled";

type Props = {
  status: OrderStatus;
};

export default function StatusChip({ status }: Props) {
  const variants: Record<
    OrderStatus,
    string
  > = {
    Pending:
      "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",

    "Supplier Assigned":
      "bg-blue-500/10 text-blue-400 border-blue-500/20",

    "Driver Assigned":
      "bg-purple-500/10 text-purple-400 border-purple-500/20",

    "Picked Up":
      "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",

    "En Route":
      "bg-orange-500/10 text-orange-400 border-orange-500/20",

    Delivered:
      "bg-green-500/10 text-green-400 border-green-500/20",

    Cancelled:
      "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${variants[status]}`}
    >
      <div className="h-2 w-2 rounded-full bg-current animate-pulse" />

      {status}
    </div>
  );
}