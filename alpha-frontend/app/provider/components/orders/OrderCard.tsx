import { ProviderOrder } from "@/types/order";

interface Props {
  order: ProviderOrder;
  onAccept: () => void;
  onReady: () => void;
}

export default function OrderCard({
  order,
  onAccept,
  onReady,
}: Props) {
  return (
    <div className="border rounded-xl p-4">

      <h3 className="font-bold">
        {order.orderNumber}
      </h3>

      <p>{order.customerName}</p>

      <p>{order.itemDescription}</p>

      {order.status ===
        "supplier_assigned" && (
        <button
          onClick={onAccept}
          className="bg-green-600 text-white px-4 py-2 rounded mt-3"
        >
          Accept Order
        </button>
      )}

      {order.status ===
        "supplier_accepted" && (
        <button
          onClick={onReady}
          className="bg-blue-600 text-white px-4 py-2 rounded mt-3"
        >
          Ready For Pickup
        </button>
      )}

    </div>
  );
}