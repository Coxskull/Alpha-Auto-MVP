"use client";

import { Driver } from "@/types/dashboard";

type Props = {
  open: boolean;
  drivers: Driver[];
  territory: string;
  onClose: () => void;
  onAssign: (driverId: string) => void;
};

export default function AssignDriverModal({
  open,
  drivers,
  territory,
  onClose,
  onAssign,
}: Props) {
  if (!open) return null;

 const sortedDrivers = drivers
  .filter(
    (d) =>
      d.availability?.toLowerCase() ===
      "available"
  )
  .map((driver) => {
    const territoryMatch =
      driver.territory?.toLowerCase() ===
      territory.toLowerCase();

    const score =
      (territoryMatch ? 100 : 0) +
      (driver.responseRate ?? 100) -
      (driver.activeJobs ?? 0) * 5;

    return {
      ...driver,
      territoryMatch,
      score,
    };
  })
  .sort((a, b) => b.score - a.score);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">

      <div className="bg-[#111827] rounded-3xl p-6 w-full max-w-3xl">

        <div className="flex items-center justify-between mb-6">

          <div>
            <h2 className="text-xl font-bold text-white">
              Assign Driver
            </h2>

            <p className="text-sm text-gray-400">
              Territory-aware driver recommendations
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>

        </div>

        <div className="space-y-4 max-h-[550px] overflow-y-auto">

          {sortedDrivers.map((driver, index) => (

            <div
              key={driver.id}
              className={`
                rounded-2xl
                border
                p-5
                ${
                  index === 0
                    ? "border-green-500/40 bg-green-500/5"
                    : "border-white/10"
                }
              `}
            >

              {index === 0 && (
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-400">
                  ⭐ Recommended Driver
                </div>
              )}

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                <div>

                  <p className="text-white font-semibold text-lg">
                    {driver.fullName}
                  </p>
<div className="flex gap-2 mt-2 flex-wrap">

  {driver.territoryMatch && (
    <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
      Territory Match
    </span>
  )}

  <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">
      Score {driver.score}
  </span>

</div>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">

                    <p className="text-gray-400 text-sm">
                      Availability:
                      <span className="ml-2 text-green-400">
                        {driver.availability}
                      </span>
                    </p>

                    <p className="text-gray-400 text-sm">
                      Territory:
                      <span className="ml-2 text-white">
                        {driver.territory}
                      </span>
                    </p>

                    <p className="text-gray-400 text-sm">
                      Active Jobs:
                      <span className="ml-2 text-white">
                        {driver.activeJobs}
                      </span>
                    </p>

                    <p className="text-gray-400 text-sm">
                      Response Rate:
                      <span className="ml-2 text-white">
                        {driver.responseRate ?? 100}%
                      </span>
                    </p>

                  </div>

                </div>

                <button
                  onClick={() =>
                    onAssign(driver.id)
                  }
                  className="bg-green-500 hover:bg-green-400 text-black font-semibold px-5 py-3 rounded-xl"
                >
                  Assign
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}