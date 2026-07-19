"use client";

import {
  BarChart3,
  CircleDollarSign,
  ClipboardList,
  Network,
  Package,
  Settings,
  Truck,
  Warehouse,
} from "lucide-react";
import RolePortalShell from "@/components/layout/RolePortalShell";

const navigation = [
  { label: "Dashboard", href: "/provider/dashboard", icon: BarChart3 },
  { label: "Orders", href: "/provider/orders", icon: ClipboardList },
  { label: "Products", href: "/provider/products", icon: Package },
  { label: "Inventory", href: "/provider/inventory", icon: Warehouse },
  { label: "Drivers", href: "/provider/drivers", icon: Truck },
  { label: "Earnings", href: "/provider/earnings", icon: CircleDollarSign },
  { label: "Settings", href: "/provider/settings", icon: Settings },
  { label: "My Network", href: "/referrals", icon: Network },
];

export default function ProviderApp({ children }: { children: React.ReactNode }) {
  return (
    <RolePortalShell
      title="Provider Portal"
      subtitle="Manage orders, product inventory, fulfillment, and earnings."
      navigation={navigation}
      homeHref="/provider/dashboard"
      accentLabel="Open"
    >
      {children}
    </RolePortalShell>
  );
}
