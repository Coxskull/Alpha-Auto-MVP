import RoleGuard from "@/components/auth/RoleGuard";

export default function MissionControlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["admin", "dispatcher"]}>
      {children}
    </RoleGuard>
  );
}