// components/auth/RoleGuard.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";

type RoleGuardProps = {
  allowedRoles: string[];
  children: React.ReactNode;
};

export default function RoleGuard({
  allowedRoles,
  children,
}: RoleGuardProps) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("alpha_token");

        if (!token) {
          router.replace("/");
          return;
        }

        const res = await api.get("/api/Auth/me");
        const role = res.data.role?.toLowerCase();

        if (!allowedRoles.includes(role)) {
          router.replace("/unauthorized");
          return;
        }

        setAllowed(true);
      } catch {
        localStorage.removeItem("alpha_token");
        localStorage.removeItem("alpha_user");
        router.replace("/");
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, [allowedRoles, router]);

  if (checking) {
    return (
      <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        Checking access...
      </main>
    );
  }

  if (!allowed) return null;

  return <>{children}</>;
}