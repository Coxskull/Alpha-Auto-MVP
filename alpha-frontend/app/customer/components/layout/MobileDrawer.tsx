"use client";

import Link from "next/link";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function MobileDrawer({
  open,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      <aside className="fixed left-0 top-0 h-full w-72 bg-white z-50">

        <div className="p-6 border-b">
          <h2 className="font-bold text-xl">
            ALPHA
          </h2>
        </div>

        <nav className="p-4 space-y-3">

          <Link href="/">
            Home
          </Link>

          <Link href="/orders">
            Orders
          </Link>

          <Link href="/garage">
            Garage
          </Link>

          <Link href="/account">
            Account
          </Link>

        </nav>

      </aside>
    </>
  );
}