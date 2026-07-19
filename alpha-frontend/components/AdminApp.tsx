"use client";

import {
  AlertTriangle,
  BarChart3,
  LayoutDashboard,
  MessageSquare,
  Network,
  Package,
  Settings,
  Store,
  Truck,
  Users,
  WalletCards,
} from "lucide-react";
import RolePortalShell from "./layout/RolePortalShell";

const navigation = [
  { label: "Dashboard", href: "/mission-control/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/mission-control/orders", icon: Package },
  { label: "Drivers", href: "/mission-control/drivers", icon: Truck },
  { label: "Suppliers", href: "/mission-control/suppliers", icon: Store },
  { label: "Users", href: "/mission-control/users", icon: Users },
  { label: "Analytics", href: "/mission-control/analytics", icon: BarChart3 },
  { label: "Messages", href: "/mission-control/messages", icon: MessageSquare },
  { label: "Escalations", href: "/mission-control/escalations", icon: AlertTriangle },
  { label: "Settlements", href: "/mission-control/settlement-queue", icon: WalletCards },
  { label: "Settings", href: "/mission-control/settings", icon: Settings },
  { label: "Referral Network", href: "/mission-control/referrals", icon: Network },
];

export default function AdminApp({ children }: { children: React.ReactNode }) {
  return (
    <RolePortalShell
      title="Mission Control"
      subtitle="Real-time dispatch, operations, and financial oversight."
      navigation={navigation}
      homeHref="/mission-control/dashboard"
      accentLabel="Live"
    >
      {children}
    </RolePortalShell>
  );
}
