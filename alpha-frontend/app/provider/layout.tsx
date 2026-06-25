import RoleGuard from "@/components/auth/RoleGuard";

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["supplier", "provider"]}>
      {children}
    </RoleGuard>
  );
}