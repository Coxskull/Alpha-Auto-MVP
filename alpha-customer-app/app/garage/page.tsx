"use client";

import VehicleSelector from "@/components/VehicleSelector";

export default function GaragePage() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold">
        My Garage
      </h1>

      <VehicleSelector />
    </main>
  );
}