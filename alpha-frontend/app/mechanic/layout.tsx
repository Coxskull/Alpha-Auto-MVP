import RoleGuard from "@/components/auth/RoleGuard";
import MechanicApp from "@/components/mechanic/MechanicApp";

export default function MechanicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["mechanic"]}>
      <MechanicApp>{children}</MechanicApp>
    </RoleGuard>
  );
}