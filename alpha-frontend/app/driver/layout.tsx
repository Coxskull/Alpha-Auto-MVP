import RoleGuard from "@/components/auth/RoleGuard";
import DriverApp from "@/components/driver/DriverApp";

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["driver"]}>
      <DriverApp>{children}</DriverApp>
    </RoleGuard>
  );
}