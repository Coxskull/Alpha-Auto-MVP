"use client";

import { useState } from "react";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

type Props = {
  children: React.ReactNode;
};

export default function AdminApp({
  children,
}: Props) {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0B0F14]">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() =>
              setSidebarOpen(false)
            }
          />

          {/* Drawer */}
          <div
  className="
    relative
    transition-transform
    duration-300
    translate-x-0
  "
>
            <Sidebar
              mobile
              onClose={() =>
                setSidebarOpen(false)
              }
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <Topbar
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#0B0F14]">
          {children}
        </main>
      </div>
    </div>
  );
}