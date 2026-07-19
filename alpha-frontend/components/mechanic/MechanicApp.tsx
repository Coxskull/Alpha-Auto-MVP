"use client";

import { ClipboardList, History, LayoutDashboard, Network, Wrench } from "lucide-react";
import RolePortalShell from "@/components/layout/RolePortalShell";

const navigation = [
  { label: "Dashboard", href: "/mechanic/dashboard", icon: LayoutDashboard },
  { label: "Active Jobs", href: "/mechanic/jobs", icon: Wrench },
  { label: "History", href: "/mechanic/history", icon: History },
  { label: "Requests", href: "/mechanic/dashboard", icon: ClipboardList },
  { label: "My Network", href: "/mechanic/referrals", icon: Network },
];

export default function MechanicApp({ children }: { children: React.ReactNode }) {
  return (
    <RolePortalShell
      title="Mechanic Portal"
      subtitle="Review service requests, manage repairs, and upload completion proof."
      navigation={navigation}
      homeHref="/mechanic/dashboard"
      accentLabel="Available"
      searchable={false}
    >
      {children}
    </RolePortalShell>
  );
}
