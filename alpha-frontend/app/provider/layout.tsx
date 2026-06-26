import RoleGuard from "@/components/auth/RoleGuard";
import ProviderSidebar from "@/components/provider/layout/ProviderSidebar";

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["supplier", "provider"]}>
      <div className="flex min-h-screen bg-[#020617] text-white">
        <ProviderSidebar />

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </RoleGuard>
  );
}