import RoleGuard from "@/components/auth/RoleGuard";
import AdminApp from "@/components/AdminApp";

export default function MissionControlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <AdminApp>{children}</AdminApp>
  );
}