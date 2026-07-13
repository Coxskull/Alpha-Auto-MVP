"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import {
  Bell,
  ChevronDown,
  CircleHelp,
  LogOut,
  Menu,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";
import AlphaLogo from "@/components/branding/AlphaLogo";

type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
};

type RolePortalShellProps = {
  children: ReactNode;
  title: string;
  subtitle: string;
  navigation: NavigationItem[];
  homeHref: string;
  accentLabel?: string;
  searchable?: boolean;
};

export default function RolePortalShell({
  children,
  title,
  subtitle,
  navigation,
  homeHref,
  accentLabel = "Online",
  searchable = true,
}: RolePortalShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const currentPage = useMemo(() => {
    return (
      navigation.find(
        (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
      )?.label ?? title
    );
  }, [navigation, pathname, title]);

  function signOut() {
    localStorage.removeItem("alpha_token");
    localStorage.removeItem("alpha_user");
    window.dispatchEvent(new Event("alpha-auth-changed"));
    router.push("/");
  }

  const navigationContent = (
    <>
      <div className="flex h-20 items-center justify-between border-b border-slate-200 px-5">
        <Link href={homeHref} className="flex items-center gap-3" onClick={() => setDrawerOpen(false)}>
          <AlphaLogo />
        </Link>
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setDrawerOpen(false)}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <X size={20} />
        </button>
      </div>

      <div className="px-4 py-5">
        <div className="rounded-2xl bg-gradient-to-br from-[#32117a] to-[#6f2bd3] p-4 text-white shadow-lg shadow-purple-900/10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-200">
            Alpha Workspace
          </p>
          <p className="mt-2 text-lg font-bold">{title}</p>
          <p className="mt-1 text-xs leading-5 text-purple-100">{subtitle}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {navigation.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setDrawerOpen(false)}
              className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
                active
                  ? "bg-purple-50 text-[#4d1aa5] shadow-sm ring-1 ring-purple-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              }`}
            >
              <span
                className={`grid h-9 w-9 place-items-center rounded-xl transition ${
                  active ? "bg-[#5a22b8] text-white" : "bg-slate-100 text-slate-500 group-hover:text-[#5a22b8]"
                }`}
              >
                <Icon size={18} />
              </span>
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && (
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-[#5a22b8]">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100">
            <LogOut size={18} />
          </span>
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="alpha-portal min-h-screen bg-[#f5f6fa] text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] flex-col border-r border-slate-200 bg-white lg:flex">
        {navigationContent}
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="relative flex h-full w-[88%] max-w-[320px] flex-col bg-white shadow-2xl">
            {navigationContent}
          </aside>
        </div>
      )}

      <div className="lg:pl-[280px]">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
          <div className="flex h-20 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setDrawerOpen(true)}
              className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-slate-700 lg:hidden"
            >
              <Menu size={20} />
            </button>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6b2bc3]">{title}</p>
              <h1 className="truncate text-lg font-bold text-slate-950 sm:text-xl">{currentPage}</h1>
            </div>

            {searchable && (
              <div className="ml-auto hidden w-full max-w-md md:block">
                <label className="relative block">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="search"
                    placeholder="Search orders, jobs, users..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-purple-300 focus:bg-white focus:ring-4 focus:ring-purple-100"
                  />
                </label>
              </div>
            )}

            <div className="ml-auto flex items-center gap-2 md:ml-3">
              <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 sm:flex">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {accentLabel}
              </div>

              <button type="button" className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" aria-label="Help">
                <CircleHelp size={19} />
              </button>
              <button type="button" className="relative grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" aria-label="Notifications">
                <Bell size={19} />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-purple-600 ring-2 ring-white" />
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((value) => !value)}
                  className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 hover:bg-slate-50"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[#4d159d] to-[#7a3add] text-sm font-bold text-white">A</span>
                  <ChevronDown size={16} className="text-slate-400" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                    <button type="button" onClick={signOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600">
                      <LogOut size={16} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-80px)] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-[74px] items-center justify-around border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        {navigation.slice(0, 5).map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={`flex min-w-14 flex-col items-center gap-1 text-[10px] font-bold ${active ? "text-[#5a22b8]" : "text-slate-500"}`}>
              <span className={`grid h-9 w-9 place-items-center rounded-xl ${active ? "bg-purple-100" : ""}`}><Icon size={19} /></span>
              <span className="max-w-16 truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
