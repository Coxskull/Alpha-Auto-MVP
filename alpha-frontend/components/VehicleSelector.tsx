"use client";

import { CarFront, ChevronDown } from "lucide-react";
import { useState } from "react";

const years = Array.from({ length: 20 }, (_, index) => String(2026 - index));
const makes = ["Honda", "Toyota", "Ford", "Chevrolet", "Nissan", "Hyundai"];
const models = ["Civic", "Corolla", "Ranger", "Cruze", "Navara", "Accent"];

export default function VehicleSelector() {
  const [year, setYear] = useState("2015");
  const [make, setMake] = useState("Honda");
  const [model, setModel] = useState("Civic");

  const selectClass =
    "w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-3 pr-9 text-sm font-semibold text-slate-800 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4">
        <h2 className="text-base font-extrabold text-slate-950">
          1. Select Your Vehicle
        </h2>
        <p className="mt-1 text-xs text-slate-500">Helps us find the right parts</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <label className="relative">
          <span className="mb-1.5 block text-[11px] font-semibold text-slate-500">Year</span>
          <select value={year} onChange={(event) => setYear(event.target.value)} className={selectClass}>
            {years.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute bottom-3.5 right-3 text-slate-400" size={15} />
        </label>

        <label className="relative">
          <span className="mb-1.5 block text-[11px] font-semibold text-slate-500">Make</span>
          <select value={make} onChange={(event) => setMake(event.target.value)} className={selectClass}>
            {makes.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute bottom-3.5 right-3 text-slate-400" size={15} />
        </label>

        <label className="relative">
          <span className="mb-1.5 block text-[11px] font-semibold text-slate-500">Model</span>
          <select value={model} onChange={(event) => setModel(event.target.value)} className={selectClass}>
            {models.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute bottom-3.5 right-3 text-slate-400" size={15} />
        </label>

        <button
          type="button"
          className="mt-[22px] flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
        >
          <CarFront size={18} />
          More Details
        </button>
      </div>
    </section>
  );
}
