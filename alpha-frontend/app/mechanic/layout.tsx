import RoleGuard from "@/components/auth/RoleGuard";

export default function MechanicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["mechanic"]}>
      {children}
    </RoleGuard>
  );
}