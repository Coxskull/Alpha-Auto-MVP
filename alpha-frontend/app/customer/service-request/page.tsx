"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createServiceRequest } from "@/services/serviceRequests";

export default function CustomerServiceRequestPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    vehicleInfo: "",
    issueDescription: "",
    serviceAddress: "",
    zone: "",
    finalAmount: 0,
  });

  const [loading, setLoading] = useState(false);

  function update(key: string, value: string | number) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function submit() {
    setLoading(true);

    try {
      const request = await createServiceRequest({
        ...form,
        finalAmount: Number(form.finalAmount),
      });

      router.push(`/customer/tracking/${request.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0B0F14] p-5 text-white">
      <h1 className="text-2xl font-bold">Request Mechanic</h1>

      <p className="text-gray-400 mt-1">
        Create a mobile mechanic service request.
      </p>

      <div className="mt-6 space-y-4">
        <input
          className="w-full rounded-xl bg-[#111827] border border-white/10 p-4"
          placeholder="Customer name"
          value={form.customerName}
          onChange={(e) => update("customerName", e.target.value)}
        />

        <input
          className="w-full rounded-xl bg-[#111827] border border-white/10 p-4"
          placeholder="Phone number"
          value={form.customerPhone}
          onChange={(e) => update("customerPhone", e.target.value)}
        />

        <input
          className="w-full rounded-xl bg-[#111827] border border-white/10 p-4"
          placeholder="Vehicle info e.g. Toyota Vios 2018"
          value={form.vehicleInfo}
          onChange={(e) => update("vehicleInfo", e.target.value)}
        />

        <textarea
          className="w-full rounded-xl bg-[#111827] border border-white/10 p-4"
          placeholder="Describe the car issue"
          value={form.issueDescription}
          onChange={(e) => update("issueDescription", e.target.value)}
        />

        <input
          className="w-full rounded-xl bg-[#111827] border border-white/10 p-4"
          placeholder="Service address"
          value={form.serviceAddress}
          onChange={(e) => update("serviceAddress", e.target.value)}
        />

        <input
          className="w-full rounded-xl bg-[#111827] border border-white/10 p-4"
          placeholder="Zone e.g. Guadalupe"
          value={form.zone}
          onChange={(e) => update("zone", e.target.value)}
        />

        <input
          type="number"
          className="w-full rounded-xl bg-[#111827] border border-white/10 p-4"
          placeholder="Estimated amount"
          value={form.finalAmount}
          onChange={(e) => update("finalAmount", Number(e.target.value))}
        />

        <button
          onClick={submit}
          disabled={loading}
          className="w-full rounded-xl bg-yellow-400 py-4 font-bold text-black disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Mechanic Request"}
        </button>
      </div>
    </main>
  );
}