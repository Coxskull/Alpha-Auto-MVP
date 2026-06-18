"use client";

import { CartItem } from "@/types/cart";

interface Props {
  item: CartItem;
  onRemove?: () => void;
}

export default function CartItemComponent({
  item,
  onRemove,
}: Props) {
  return (
    <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-white">
            {item.productName}
          </h3>

          <p className="text-slate-400 text-sm">
            Qty: {item.quantity}
          </p>

          <p className="text-green-400 font-bold">
            ₱{item.price}
          </p>
        </div>

        {onRemove && (
          <button
            onClick={onRemove}
            className="text-red-500"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}