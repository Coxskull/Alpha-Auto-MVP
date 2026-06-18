"use client";

import TopBar from "./TopBar";
import BottomNavigation from "./BottomNavigation";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopBar />

      <main className="pb-24">
        {children}
      </main>

      <BottomNavigation />
    </>
  );
}