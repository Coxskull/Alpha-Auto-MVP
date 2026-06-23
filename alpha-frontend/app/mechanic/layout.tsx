export default function MechanicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#020617] text-white">
      {children}
    </main>
  );
}