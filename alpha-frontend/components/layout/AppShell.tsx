"use client";

import Topbar from "./Topbar";
import BottomNavigation from "./BottomNavigation";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Topbar />

      <main className="pb-24">
        {children}
      </main>

      <BottomNavigation />
    </>
  );
}