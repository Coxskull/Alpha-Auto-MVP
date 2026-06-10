"use client";

import { useEffect, useState } from "react";
 import { DashboardStats } from "@/types/dashboard";
import api from "@/services/api";

export default function StatusCards() {


const [stats, setStats] =
  useState<DashboardStats | null>(null);


  const fetchStats = async () => {
    try {
      const response = await api.get(
        "/Dashboard/stats"
      );

      setStats(response.data);
    } catch (error) {
      console.error(error);
    }
  };
useEffect(() => {
  const loadStats = async () => {
    await fetchStats();
  };

  loadStats();
}, []);
  if (!stats) {
    return <div>Loading stats...</div>;
  }

  return (
    <div>
      {/* Use stats.liveOrders etc */}
    </div>
  );
}