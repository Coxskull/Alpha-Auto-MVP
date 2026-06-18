"use client";

import { useState } from "react";

export default function VehicleSelector() {
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");

  return (
    <div className="bg-white rounded-xl p-4 border">
      <h2 className="font-semibold mb-4">
        Select Vehicle
      </h2>

      <div className="grid grid-cols-3 gap-2">
        <input
          placeholder="Year"
          value={year}
          onChange={(e) =>
            setYear(e.target.value)
          }
          className="border rounded p-2"
        />

        <input
          placeholder="Make"
          value={make}
          onChange={(e) =>
            setMake(e.target.value)
          }
          className="border rounded p-2"
        />

        <input
          placeholder="Model"
          value={model}
          onChange={(e) =>
            setModel(e.target.value)
          }
          className="border rounded p-2"
        />
      </div>
    </div>
  );
}