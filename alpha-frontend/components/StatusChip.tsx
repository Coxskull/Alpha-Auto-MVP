import type { OrderStatus } from "@/types/dashboard";

type Props = {
  status: OrderStatus;
};

export default function StatusChip({ status }: Props) {
  const variants: Record<OrderStatus, string> = {
    payment_pending:
      "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",

    pending:
      "bg-amber-500/10 text-amber-400 border-amber-500/20",

    supplier_assigned:
      "bg-blue-500/10 text-blue-400 border-blue-500/20",

    supplier_accepted:
      "bg-sky-500/10 text-sky-400 border-sky-500/20",

    provider_assigned:
      "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",

    provider_accepted:
      "bg-violet-500/10 text-violet-300 border-violet-500/20",

    mechanic_assigned:
      "bg-purple-500/10 text-purple-400 border-purple-500/20",

    mechanic_accepted:
      "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",

    parts_requested:
      "bg-orange-500/10 text-orange-300 border-orange-500/20",

    ready_for_pickup:
      "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",

    driver_assigned:
      "bg-purple-500/10 text-purple-400 border-purple-500/20",

    driver_accepted:
      "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",

    picked_up:
      "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",

    en_route:
      "bg-orange-500/10 text-orange-400 border-orange-500/20",

    arrived:
      "bg-pink-500/10 text-pink-400 border-pink-500/20",

    delivered:
      "bg-green-500/10 text-green-400 border-green-500/20",

    proof_uploaded:
      "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",

    completed:
      "bg-lime-500/10 text-lime-300 border-lime-500/20",

    cancelled:
      "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const label = status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${variants[status]}`}
    >
      <div className="h-2 w-2 rounded-full bg-current animate-pulse" />
      {label}
    </div>
  );
}