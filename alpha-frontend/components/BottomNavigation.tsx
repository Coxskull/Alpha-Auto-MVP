"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, ClipboardList, Home, Network, ShoppingCart, User } from "lucide-react";

const items = [
  { href: "/customer", label: "Home", icon: Home },
  { href: "/customer/orders", label: "Orders", icon: ClipboardList },
  { href: "/customer/cart", label: "Cart", icon: ShoppingCart },
  { href: "/customer/garage", label: "Garage", icon: Car },
  { href: "/customer/account", label: "Account", icon: User },
  { label: "My Network", href: "/customer/referrals", icon: Network },
];

export default function BottomNavigation({ cartCount = 0 }: { cartCount?: number }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden">
      <div className="mx-auto flex h-[74px] max-w-xl items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/customer" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-bold transition ${active ? "text-violet-700" : "text-slate-500"}`}
            >
              <Icon size={20} strokeWidth={active ? 2.6 : 2} />
              {label}
              {href === "/customer/cart" && cartCount > 0 && (
                <span className="absolute right-1 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-700 px-1 text-[9px] font-black text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
