import ProviderSidebar from "@/components/provider/layout/ProviderSidebar";
import ProviderHeader from "@/components/provider/layout/ProviderHeader";

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex">
      <ProviderSidebar />
      <div className="flex-1">
        <ProviderHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
