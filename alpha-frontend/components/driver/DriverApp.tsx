"use client";

import { CircleDollarSign, ClipboardList, History, LayoutDashboard, Network, Settings } from "lucide-react";
import RolePortalShell from "@/components/layout/RolePortalShell";

const navigation = [
  { label: "Dashboard", href: "/driver/dashboard", icon: LayoutDashboard },
  { label: "Deliveries", href: "/driver/orders", icon: ClipboardList },
  { label: "Earnings", href: "/driver/wallet", icon: CircleDollarSign },
  { label: "History", href: "/driver/history", icon: History },
  { label: "Settings", href: "/driver/settings", icon: Settings },
  { label: "My Network", href: "/driver/referrals", icon: Network },
];

export default function DriverApp({ children }: { children: React.ReactNode }) {
  return (
    <RolePortalShell
      title="Driver Portal"
      subtitle="Manage active deliveries, status updates, and proof of delivery."
      navigation={navigation}
      homeHref="/driver/dashboard"
      accentLabel="Online"
      searchable={false}
    >
      {children}
    </RolePortalShell>
  );
}
