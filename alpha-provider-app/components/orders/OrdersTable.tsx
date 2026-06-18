"use client";

import { ProviderOrder } from "@/types/order";

interface Props {
  orders: ProviderOrder[];
  onSelect: (order: ProviderOrder) => void;
}

export default function OrdersTable({
  orders,
  onSelect,
}: Props) {
  return (
    <div className="bg-[#111827] rounded-xl border border-gray-800 overflow-hidden">

      <table className="w-full">

        <thead className="bg-[#1f2937]">

          <tr>

            <th className="text-left p-4 text-gray-300">
              Order
            </th>

            <th className="text-left p-4 text-gray-300">
              Customer
            </th>

            <th className="text-left p-4 text-gray-300">
              Item
            </th>

            <th className="text-left p-4 text-gray-300">
              Status
            </th>

            <th className="text-left p-4 text-gray-300">
              Actions
            </th>

          </tr>

        </thead>

        <tbody>

          {orders.map((order) => (
            <tr
              key={order.id}
              className="border-t border-gray-800 hover:bg-[#1f2937]"
            >
              <td className="p-4 text-white">
                {order.orderNumber}
              </td>

              <td className="p-4 text-white">
                {order.customerName}
              </td>

              <td className="p-4 text-white">
                {order.itemDescription}
              </td>

              <td className="p-4">
                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400">
                  {order.status}
                </span>
              </td>

              <td className="p-4">

                <button
                  onClick={() => onSelect(order)}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
                >
                  View
                </button>

              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}