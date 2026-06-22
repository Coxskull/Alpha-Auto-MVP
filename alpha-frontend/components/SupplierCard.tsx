"use client";

import { Supplier } from "@/types/supplier";

export default function SupplierCard({
  supplier,
}: {
  supplier: Supplier;
}) {
  return (
    <div className="border rounded-xl p-4 bg-white">
      <h3 className="font-semibold">
        {supplier.name}
      </h3>

      <p className="text-sm text-gray-500">
        {supplier.address}
      </p>

      <p className="text-green-600 mt-2">
        {supplier.availabilityStatus}
      </p>
    </div>
  );
}