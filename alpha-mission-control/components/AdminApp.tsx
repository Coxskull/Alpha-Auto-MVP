"use client";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

type Props = {
  children: React.ReactNode;
};

export default function AdminApp({
  children,
}: Props) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0B0F14]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <Topbar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#0B0F14]">
          {children}
        </main>
      </div>
    </div>
  );
}