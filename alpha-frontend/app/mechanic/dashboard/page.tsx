"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";

type Mechanic = {
  id: string;
  fullName: string;
  availabilityStatus: string;
  serviceArea?: string;
  activeJobs: number;
};

type ServiceRequest = {
  id: string;
  customerName: string;
  customerPhone?: string;
  vehicleInfo?: string;
  issueDescription: string;
  serviceAddress: string;
  zone: string;
  status: string;
  partsRequestNote?: string;
  proofImageUrl?: string;
};

export default function MechanicDashboardPage() {
  const [mechanic, setMechanic] = useState<Mechanic | null>(null);
  const [jobs, setJobs] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [partsNotes, setPartsNotes] = useState<Record<string, string>>({});
  const [proofUrls, setProofUrls] = useState<Record<string, string>>({});

  const loadData = async () => {
    try {
      const [mechanicRes, jobsRes] = await Promise.all([
        api.get("/api/Mechanics/me"),
        api.get("/api/ServiceRequests/my"),
      ]);

      setMechanic(mechanicRes.data);
      setJobs(jobsRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateAvailability = async (status: string) => {
    await api.post("/api/Mechanics/me/availability", { status });
    await loadData();
  };

  const updateStatus = async (id: string, status: string) => {
    await api.post(`/api/ServiceRequests/${id}/status`, { status });
    await loadData();
  };

  const acceptJob = async (id: string) => {
    await api.post(`/api/ServiceRequests/${id}/accept`);
    await loadData();
  };

  const rejectJob = async (id: string) => {
    await api.post(`/api/ServiceRequests/${id}/reject`, {
      reason: "Mechanic rejected the request.",
    });

    await loadData();
  };

  const requestParts = async (id: string) => {
    await api.post(`/api/ServiceRequests/${id}/request-parts`, {
      notes: partsNotes[id] || "Parts needed.",
    });

    await loadData();
  };

  const uploadProof = async (id: string) => {
    await api.post(`/api/ServiceRequests/${id}/proof`, {
      imageUrl: proofUrls[id],
    });

    await loadData();
  };

  const completeJob = async (id: string) => {
    await api.post(`/api/ServiceRequests/${id}/complete`);
    await loadData();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        Loading mechanic dashboard...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <p className="text-green-400 font-bold uppercase">
            Mechanic App
          </p>

          <h1 className="mt-2 text-3xl md:text-5xl font-bold">
            Mechanic Dashboard
          </h1>

          <p className="mt-2 text-gray-400">
            Availability, service jobs, parts requests, proof upload, and job history.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-gray-400">Availability</p>
            <h2 className="text-2xl font-bold text-green-400">
              {mechanic?.availabilityStatus}
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">
              {["available", "busy", "offline"].map((status) => (
                <button
                  key={status}
                  onClick={() => updateAvailability(status)}
                  className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-black"
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-gray-400">Active Jobs</p>
            <h2 className="text-2xl font-bold">
              {jobs.filter((x) => x.status !== "completed" && x.status !== "closed").length}
            </h2>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-gray-400">Service Zone</p>
            <h2 className="text-2xl font-bold">
              {mechanic?.serviceArea || "No zone"}
            </h2>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-4 text-xl font-bold">
            Service Requests
          </h2>

          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-2xl border border-white/10 bg-slate-950 p-4"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold">
                      {job.customerName}
                    </h3>

                    <p className="text-sm text-gray-400">
                      {job.issueDescription}
                    </p>

                    <p className="text-xs text-gray-500">
                      Vehicle: {job.vehicleInfo || "N/A"}
                    </p>

                    <p className="text-xs text-gray-500">
                      Location: {job.serviceAddress} • {job.zone}
                    </p>

                    <span className="inline-block rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
                      {job.status}
                    </span>

                    {job.partsRequestNote && (
                      <p className="text-xs text-yellow-400">
                        Parts: {job.partsRequestNote}
                      </p>
                    )}

                    {job.proofImageUrl && (
                      <a
                        href={job.proofImageUrl}
                        target="_blank"
                        className="block text-xs text-blue-400 underline"
                      >
                        View proof image
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <button
                      onClick={() => acceptJob(job.id)}
                      className="rounded-xl bg-green-500 px-4 py-2 font-bold text-black"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() => rejectJob(job.id)}
                      className="rounded-xl bg-red-500 px-4 py-2 font-bold text-white"
                    >
                      Reject
                    </button>

                    <button
                      onClick={() => updateStatus(job.id, "en_route")}
                      className="rounded-xl bg-blue-500 px-4 py-2 font-bold text-white"
                    >
                      En Route
                    </button>

                    <button
                      onClick={() => updateStatus(job.id, "started")}
                      className="rounded-xl bg-purple-500 px-4 py-2 font-bold text-white"
                    >
                      Started
                    </button>

                    <button
                      onClick={() => completeJob(job.id)}
                      className="rounded-xl bg-white px-4 py-2 font-bold text-black"
                    >
                      Complete
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <input
                      value={partsNotes[job.id] || ""}
                      onChange={(e) =>
                        setPartsNotes({
                          ...partsNotes,
                          [job.id]: e.target.value,
                        })
                      }
                      placeholder="Parts request notes"
                      className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white"
                    />

                    <button
                      onClick={() => requestParts(job.id)}
                      className="mt-2 rounded-xl bg-yellow-500 px-4 py-2 font-bold text-black"
                    >
                      Request Parts
                    </button>
                  </div>

                  <div>
                    <input
                      value={proofUrls[job.id] || ""}
                      onChange={(e) =>
                        setProofUrls({
                          ...proofUrls,
                          [job.id]: e.target.value,
                        })
                      }
                      placeholder="Proof image URL"
                      className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white"
                    />

                    <button
                      onClick={() => uploadProof(job.id)}
                      className="mt-2 rounded-xl bg-sky-500 px-4 py-2 font-bold text-white"
                    >
                      Upload Proof
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {jobs.length === 0 && (
              <p className="text-gray-400">
                No assigned mechanic jobs yet.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-4 text-xl font-bold">
            Job History
          </h2>

          <div className="space-y-2">
            {jobs
              .filter((job) => job.status === "completed" || job.status === "closed")
              .map((job) => (
                <div
                  key={job.id}
                  className="rounded-xl border border-white/10 bg-black p-4"
                >
                  <p className="font-bold">{job.customerName}</p>
                  <p className="text-sm text-gray-400">{job.issueDescription}</p>
                  <p className="text-xs text-green-400">{job.status}</p>
                </div>
              ))}
          </div>
        </section>
      </div>
    </main>
  );
}