import AdminApp from "@/components/AdminApp";

export default function MissionControlLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminApp>{children}</AdminApp>;
}
