"use client";

import { useEffect, useState } from "react";

import api from "@/services/api";

import { Supplier } from "@/types/dashboard";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] =
    useState<Supplier[]>([]);

  const [loading, setLoading] =
    useState(true);

  const fetchSuppliers = async () => {
    try {
      const response = await api.get(
        "/Suppliers"
      );

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

  return (
    <div className="p-8 bg-[#070B11] min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">
          Suppliers
        </h1>

        <p className="text-gray-400 mt-2">
          Supplier network operations
        </p>
      </div>

      {loading ? (
        <div className="text-gray-400">
          Loading suppliers...
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {suppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="bg-[#111827] rounded-3xl p-6 border border-white/5"
            >
              <h2 className="text-white text-xl font-bold">
                {supplier.businessName || supplier.name}
              </h2>

              <div className="mt-4">
                <span className="px-3 py-1 rounded-full text-sm bg-green-500/10 text-green-400 border border-green-500/20">
                  {supplier.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}