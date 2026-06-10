"use client";

import api from "./api";


// ======================================================
// GET ALL DRIVERS
// ======================================================

export const getDrivers = async () => {

  const response =
    await api.get("/Drivers");

  return response.data;
};


// ======================================================
// GET DRIVER BY ID
// ======================================================

export const getDriverById = async (
  id: number
) => {

  const response =
    await api.get(`/Drivers/${id}`);

  return response.data;
};


// ======================================================
// GET ALL SUPPLIERS
// ======================================================

export const getSuppliers = async () => {

  const response =
    await api.get("/Suppliers");

  return response.data;
};


// ======================================================
// GET SUPPLIER BY ID
// ======================================================

export const getSupplierById = async (
  id: number
) => {

  const response =
    await api.get(`/Suppliers/${id}`);

  return response.data;
};