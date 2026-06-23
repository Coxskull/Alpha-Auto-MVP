"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";

type ServiceRequest = {
  id: string;
  customerName: string;
  vehicleInfo?: string;
  issueDescription: string;
  serviceAddress: string;
  zone: string;
  status: string;
};

export default function MechanicDashboardPage() {
  const [jobs, setJobs] = useState<ServiceRequest[]>([]);

  const loadJobs = async () => {
    const res = await api.get("/api/ServiceRequests");
    setJobs(res.data);
  };

useEffect(() => {
  const fetchJobs = async () => {
    await loadJobs();
  };

  fetchJobs();
}, []);

  const updateStatus = async (id: string, action: string) => {
    await api.post(`/api/ServiceRequests/${id}/${action}`);
    await loadJobs();
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <p className="text-green-400 font-bold uppercase">
            Mechanic Panel
          </p>
          <h1 className="text-3xl md:text-5xl font-bold mt-2">
            Mechanic Dashboard
          </h1>
          <p className="text-gray-400 mt-2">
            Service jobs, repair progress, and proof uploads.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-3xl bg-white/5 border border-white/10 p-5">
            <p className="text-gray-400">Availability</p>
            <h2 className="text-2xl font-bold text-green-400">
              Available
            </h2>
          </div>

          <div className="rounded-3xl bg-white/5 border border-white/10 p-5">
            <p className="text-gray-400">Active Jobs</p>
            <h2 className="text-2xl font-bold">{jobs.length}</h2>
          </div>

          <div className="rounded-3xl bg-white/5 border border-white/10 p-5">
            <p className="text-gray-400">Service Area</p>
            <h2 className="text-2xl font-bold">Monterrey</h2>
          </div>
        </div>

        <div className="rounded-3xl bg-white/5 border border-white/10 p-5">
          <h2 className="text-xl font-bold mb-4">
            Service Requests
          </h2>

          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-2xl bg-slate-950 border border-white/10 p-4"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="font-bold">
                      {job.customerName}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {job.issueDescription}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {job.serviceAddress} • {job.zone}
                    </p>
                    <span className="inline-block mt-3 rounded-full bg-green-500/10 text-green-400 px-3 py-1 text-xs">
                      {job.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => updateStatus(job.id, "accept")}
                      className="px-4 py-2 rounded-xl bg-green-500 text-black font-bold"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() => updateStatus(job.id, "in-progress")}
                      className="px-4 py-2 rounded-xl bg-blue-500 text-white font-bold"
                    >
                      In Progress
                    </button>

                    <button
                      onClick={() => updateStatus(job.id, "complete")}
                      className="px-4 py-2 rounded-xl bg-white text-black font-bold"
                    >
                      Complete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {jobs.length === 0 && (
              <p className="text-gray-400">
                No service requests yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}