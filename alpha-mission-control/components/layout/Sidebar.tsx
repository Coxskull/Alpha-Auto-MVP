"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Truck,
  Store,
  BarChart3,
  MessageSquare,
  AlertTriangle,
  Settings,
} from "lucide-react";

const navItems = [
  {
    label: "Mission Control",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Orders",
    href: "/orders",
    icon: Package,
  },
  {
    label: "Drivers",
    href: "/drivers",
    icon: Truck,
  },
  {
    label: "Suppliers",
    href: "/suppliers",
    icon: Store,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    label: "Messages",
    href: "/messages",
    icon: MessageSquare,
  },
  {
    label: "Escalations",
    href: "/escalations",
    icon: AlertTriangle,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[270px] h-screen bg-[#0B0F14] border-r border-white/5 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-green-500/20 flex items-center justify-center border border-green-500/30">
            <span className="text-green-400 font-bold text-xl">A</span>
          </div>

          <div>
            <h1 className="text-white font-bold text-xl tracking-wide">
              ALPHA
            </h1>
            <p className="text-gray-400 text-xs">
              Mission Control
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;

         const isActive =
  pathname === item.href ||
  (pathname?.startsWith(item.href) ?? false);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? "bg-green-500 text-black shadow-lg shadow-green-500/20"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon
                size={20}
                className={`${
                  isActive
                    ? "text-black"
                    : "text-gray-400 group-hover:text-white"
                }`}
              />

              <span className="font-medium text-sm">
                {item.label}
              </span>

              {isActive && (
                <div className="ml-auto h-2 w-2 rounded-full bg-black" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <div className="rounded-2xl bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-semibold">
                System Status
              </p>
              <p className="text-green-400 text-xs mt-1">
                All systems operational
              </p>
            </div>

            <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse" />
          </div>
        </div>
      </div>
    </aside>
  );
}