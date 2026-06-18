"use client";

import { Supplier } from "@/types/dashboard";

type Props = {
  open: boolean;
  suppliers: Supplier[];
  territory: string;
  onClose: () => void;
  onAssign: (supplierId: string) => void;
};

export default function AssignSupplierModal({
  open,
  suppliers,
  territory,
  onClose,
  onAssign,
}: Props) {
  if (!open) return null;

 const scoredSuppliers = suppliers
  .filter(
    (s) =>
      s.availability?.toLowerCase() ===
      "available"
  )
  .map((supplier) => {
    const territoryMatch =
      supplier.territory?.toLowerCase() ===
      territory.toLowerCase();

    const score =
      (territoryMatch ? 100 : 0) +
      (supplier.responseRate ?? 100) -
      supplier.currentWorkload * 5;

    return {
      ...supplier,
      territoryMatch,
      score,
    };
  })
  .sort((a, b) => b.score - a.score);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-[#111827] p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">
              Assign Supplier
            </h2>

            <p className="text-sm text-gray-400">
              Territory-aware supplier recommendations
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Supplier List */}
        <div className="space-y-4 max-h-[550px] overflow-y-auto">
          {scoredSuppliers.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-[#0B0F14] p-6 text-center">
              <p className="text-gray-400">
                No available suppliers.
              </p>
            </div>
          ) : (
            scoredSuppliers.map((supplier, index) => (
              <div
                key={supplier.id}
                className={`
                  rounded-2xl
                  border
                  p-5
                  ${
                    index === 0
                      ? "border-green-500/40 bg-green-500/5"
                      : "border-white/5 bg-[#0B0F14]"
                  }
                `}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                  <div>

                    {index === 0 && (
                      <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-400">
                        ⭐ Recommended Match
                      </div>
                    )}

                    <h3 className="text-lg font-semibold text-white">
                      {supplier.name}
                    </h3>
                    <div className="flex gap-2 mt-2 flex-wrap">

  {supplier.territoryMatch && (
    <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
      Territory Match
    </span>
  )}

  <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">
    Score {supplier.score}
  </span>

</div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">

                      <p className="text-sm text-gray-400">
                        Availability:
                        <span className="ml-2 text-green-400">
                          {supplier.availability}
                        </span>
                      </p>

                      <p className="text-sm text-gray-400">
                        Territory:
                        <span className="ml-2 text-white">
                          {supplier.territory}
                        </span>
                      </p>

                      <p className="text-sm text-gray-400">
                        Current Workload:
                        <span className="ml-2 text-white">
                          {supplier.currentWorkload}
                        </span>
                      </p>

                      <p className="text-sm text-gray-400">
                        Response Rate:
                        <span className="ml-2 text-white">
                          {supplier.responseRate ?? 100}%
                        </span>
                      </p>

                    </div>
                  </div>

                  <button
                    onClick={() =>
                      onAssign(
                        supplier.id.toString()
                      )
                    }
                    className="bg-green-500 hover:bg-green-400 text-black font-semibold px-5 py-3 rounded-xl transition-all"
                  >
                    Assign
                  </button>

                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 px-5 py-3 text-gray-300 hover:bg-white/5"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}