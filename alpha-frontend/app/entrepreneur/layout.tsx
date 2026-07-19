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
        "admin",
        "dispatcher",
      ]}
    >
      {children}
    </RoleGuard>
  );
}