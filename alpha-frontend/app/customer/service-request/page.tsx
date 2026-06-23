"use client";

import { useState } from "react";
import api from "@/services/api";

export default function ServiceRequestPage() {
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    vehicleInfo: "",
    issueDescription: "",
    serviceAddress: "",
    zone: "Guadalupe",
    latitude: 25.676,
    longitude: -100.256,
  });

  const submit = async () => {
    const res = await api.post("/api/ServiceRequests", form);

    alert(`Service request created: ${res.data.id}`);
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white p-4">
      <div className="max-w-xl mx-auto rounded-3xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-3xl font-bold">
          Request Mechanic Service
        </h1>

        <div className="space-y-3 mt-6">
          {Object.entries(form).map(([key, value]) => (
            <input
              key={key}
              value={value}
              onChange={(e) =>
                setForm({
                  ...form,
                  [key]: e.target.value,
                })
              }
              placeholder={key}
              className="w-full rounded-xl bg-slate-950 border border-white/10 px-4 py-3"
            />
          ))}

          <button
            onClick={submit}
            className="w-full rounded-xl bg-green-500 text-black font-bold py-3"
          >
            Submit Request
          </button>
        </div>
      </div>
    </main>
  );
}