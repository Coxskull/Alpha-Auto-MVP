"use client";

import {
  useEffect,
  useState,
} from "react";

import api from "@/services/api";

import { Supplier } from "@/types/dashboard";

import {
  Store,
} from "lucide-react";

const statusStyles: Record<
  string,
  string
> = {
  Available:
    "bg-green-500/10 text-green-400 border-green-500/20",

  Busy:
    "bg-orange-500/10 text-orange-400 border-orange-500/20",

  Closed:
    "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function SupplierBoard() {
  const [suppliers, setSuppliers] =
    useState<Supplier[]>([]);

  const [loading, setLoading] =
    useState(true);

  const fetchSuppliers = async () => {
    try {
      const response =
        await api.get("/Suppliers");

      setSuppliers(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const loadSuppliers = async () => {
    await fetchSuppliers();
  };

  loadSuppliers();
}, []);
  if (loading) {
    return (
      <div className="text-gray-400">
        Loading suppliers...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {suppliers.map((supplier) => (
        <div
          key={supplier.id}
          className="rounded-2xl bg-[#0B0F14] border border-white/5 p-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <Store
                  size={24}
                  className="text-green-400"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white">
                  {supplier.businessName}
                </h3>

                <p className="text-gray-400 text-sm mt-1">
                  Supplier Network
                </p>
              </div>
            </div>

            <div
              className={`px-3 py-1.5 rounded-full border text-xs font-semibold ${statusStyles[supplier.status]}`}
            >
              {supplier.status}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}