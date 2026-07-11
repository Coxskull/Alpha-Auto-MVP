"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useSyncExternalStore } from "react";
import {
  AlertTriangle,
  BarChart3,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  Store,
  Truck,
  Users,
  WalletCards,
  X,
  type LucideIcon,
} from "lucide-react";

type SidebarProps = {
  mobile?: boolean;
  onClose?: () => void;
};

type StoredUser = {
  id?: string;
  fullName?: string;
  email?: string;
  role?: string;
};

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  allowedRoles?: string[];
};

const navItems: NavItem[] = [
  {
    label: "Mission Control",
    href: "/mission-control/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Orders",
    href: "/mission-control/orders",
    icon: Package,
  },
  {
    label: "Drivers",
    href: "/mission-control/drivers",
    icon: Truck,
  },
  {
    label: "Suppliers",
    href: "/mission-control/suppliers",
    icon: Store,
  },
  {
    label: "Users",
    href: "/mission-control/users",
    icon: Users,
    allowedRoles: ["admin"],
  },
  {
    label: "Analytics",
    href: "/mission-control/analytics",
    icon: BarChart3,
  },
  {
    label: "Messages",
    href: "/mission-control/messages",
    icon: MessageSquare,
  },
  {
    label: "Escalations",
    href: "/mission-control/escalations",
    icon: AlertTriangle,
  },
  {
    label: "Settlement Queue",
    href: "/mission-control/settlement-queue",
    icon: WalletCards,
    allowedRoles: ["admin"],
  },
  {
    label: "Settings",
    href: "/mission-control/settings",
    icon: Settings,
  },
];

function subscribeToStoredUser(
  callback: () => void
): () => void {
  function handleStorage(event: StorageEvent) {
    if (event.key === "alpha_user") {
      callback();
    }
  }

  function handleAuthChange() {
    callback();
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(
    "alpha-auth-changed",
    handleAuthChange
  );

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(
      "alpha-auth-changed",
      handleAuthChange
    );
  };
}

function getStoredUserSnapshot(): string | null {
  return localStorage.getItem("alpha_user");
}

function getServerStoredUserSnapshot(): null {
  return null;
}

function parseStoredUser(
  value: string | null
): StoredUser | null {
  if (!value) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (
      typeof parsed !== "object" ||
      parsed === null
    ) {
      return null;
    }

    return parsed as StoredUser;
  } catch {
    return null;
  }
}

export default function Sidebar({
  mobile = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  const storedUserValue = useSyncExternalStore(
    subscribeToStoredUser,
    getStoredUserSnapshot,
    getServerStoredUserSnapshot
  );

  const storedUser = useMemo(
    () => parseStoredUser(storedUserValue),
    [storedUserValue]
  );

  const normalizedRole =
    storedUser?.role?.trim().toLowerCase() ?? "";

  const visibleNavItems = useMemo(() => {
    return navItems.filter((item) => {
      if (!item.allowedRoles) {
        return true;
      }

      return item.allowedRoles.includes(normalizedRole);
    });
  }, [normalizedRole]);

  function isRouteActive(href: string): boolean {
    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  function closeMobileSidebar() {
    if (mobile) {
      onClose?.();
    }
  }

  return (
    <aside
      className={`
        flex
        h-dvh
        w-[270px]
        flex-col
        border-r
        border-white/5
        bg-[#0B0F14]
        ${mobile ? "" : "hidden lg:flex"}
      `}
    >
      {/* Header */}
      <div className="border-b border-white/5 px-6 py-6">
        <div className="flex items-center justify-between">
          <Link
            href="/mission-control/dashboard"
            onClick={closeMobileSidebar}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-green-500/30 bg-green-500/20">
              <span className="text-xl font-bold text-green-400">
                A
              </span>
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-wide text-white">
                ALPHA
              </h1>

              <p className="text-xs text-gray-400">
                Mission Control
              </p>
            </div>
          </Link>

          {mobile && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation menu"
              className="rounded-lg p-2 text-gray-400 transition hover:bg-white/5 hover:text-white lg:hidden"
            >
              <X size={22} />
            </button>
          )}
        </div>
      </div>

      {/* User information */}
      {storedUser && (
        <div className="border-b border-white/5 px-5 py-4">
          <p className="truncate text-sm font-semibold text-white">
            {storedUser.fullName || "Alpha User"}
          </p>

          <div className="mt-1 flex items-center gap-2">
            <span className="rounded-full border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-[11px] font-semibold capitalize text-green-400">
              {normalizedRole.replaceAll("_", " ") ||
                "Unknown role"}
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = isRouteActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobileSidebar}
              aria-current={
                isActive ? "page" : undefined
              }
              className={`
                group
                flex
                items-center
                gap-3
                rounded-2xl
                px-4
                py-3
                transition-all
                duration-200
                ${
                  isActive
                    ? "bg-green-500 text-black shadow-lg shadow-green-500/20"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }
              `}
            >
              <Icon
                size={20}
                className={
                  isActive
                    ? "text-black"
                    : "text-gray-400 transition-colors group-hover:text-white"
                }
              />

              <span className="text-sm font-medium">
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
      <div className="border-t border-white/5 p-4">
        <div className="rounded-2xl bg-white/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">
                System Status
              </p>

              <p className="mt-1 text-xs text-green-400">
                All systems operational
              </p>
            </div>

            <div
              className="h-3 w-3 shrink-0 animate-pulse rounded-full bg-green-400"
              aria-label="System operational"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}