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
  const [status, setStatus] = useState<"checking" | "allowed" | "blocked">("checking");

  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      const token = localStorage.getItem("alpha_token");

      if (!token) {
        router.replace("/");
        return;
      }

      try {
        const response = await api.get("/api/Auth/me");
        const role = response.data.role?.toLowerCase();

        const normalizedAllowedRoles = allowedRoles.map((x) => x.toLowerCase());

        if (!normalizedAllowedRoles.includes(role)) {
          if (active) setStatus("blocked");
          router.replace("/unauthorized");
          return;
        }

        if (active) setStatus("allowed");
      } catch {
        localStorage.removeItem("alpha_token");
        localStorage.removeItem("alpha_user");
        router.replace("/");
      }
    };

    checkAuth();

    return () => {
      active = false;
    };
  }, [router, allowedRoles]);

  if (status === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        Checking access...
      </main>
    );
  }

  if (status === "blocked") {
    return null;
  }

  return <>{children}</>;
}