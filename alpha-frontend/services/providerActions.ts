"use client";

import api from "@/services/api";


// ======================================================
// GET ALL DRIVERS
// ======================================================

export const getDrivers = async () => {

  const response =
    await api.get("/api/Drivers");

  return response.data;
};


// ======================================================
// GET DRIVER BY ID
// ======================================================

export const getDriverById = async (
  id: string
) => {

  const response =
    await api.get(`/api/Drivers/${id}`);

  return response.data;
};


// ======================================================
// GET ALL SUPPLIERS
// ======================================================

export const getSuppliers = async () => {

  const response =
    await api.get("/api/Suppliers");

  return response.data;
};


// ======================================================
// GET SUPPLIER BY ID
// ======================================================

export const getSupplierById = async (
  id: string
) => {

  const response =
    await api.get(`/api/Suppliers/${id}`);

  return response.data;
};