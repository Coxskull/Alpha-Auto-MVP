import RoleGuard from "@/components/auth/RoleGuard";

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["driver"]}>
      {children}
    </RoleGuard>
  );
}