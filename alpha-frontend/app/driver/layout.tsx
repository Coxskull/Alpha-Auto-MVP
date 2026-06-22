export default function DriverLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-screen bg-slate-950 text-white">{children}</div>;
}
