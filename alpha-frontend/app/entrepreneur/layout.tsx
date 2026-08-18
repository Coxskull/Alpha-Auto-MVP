import RoleGuard from "@/components/auth/RoleGuard";

export default function EntrepreneurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard
      allowedRoles={[
        "community_builder",
        "driver",
        "mechanic",
        "supplier",
        "provider",
        "customer",
        "admin",
        "dispatcher",
      ]}
    >
      {children}
    </RoleGuard>
  );
}