import RoleGuard from "@/components/auth/RoleGuard";
import ProviderApp from "@/components/provider/ProviderApp";

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["supplier", "provider"]}>
      <ProviderApp>{children}</ProviderApp>
    </RoleGuard>
  );
}
