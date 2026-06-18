import "./globals.css";
import ProviderSidebar from "@/components/layout/ProviderSidebar";
import ProviderHeader from "@/components/layout/ProviderHeader";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0f172a]">

        <div className="flex">

          <ProviderSidebar />

          <div className="flex-1">

            <ProviderHeader />

            <main className="p-6">
              {children}
            </main>

          </div>

        </div>

      </body>
    </html>
  );
}