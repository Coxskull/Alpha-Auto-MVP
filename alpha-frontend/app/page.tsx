import Link from "next/link";

const apps = [
  { href: "/mission-control/dashboard", title: "Mission Control", description: "Dispatcher dashboard" },
  { href: "/customer", title: "Customer App", description: "Shop and track orders" },
  { href: "/driver/dashboard", title: "Driver App", description: "Driver deliveries" },
  { href: "/provider/dashboard", title: "Provider App", description: "Supplier/provider operations" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <p className="text-green-400 font-semibold uppercase tracking-widest">Alpha Auto</p>
          <h1 className="text-4xl font-bold mt-3">Alpha Frontend Suite</h1>
          <p className="text-gray-400 mt-3">Choose an application.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {apps.map((app) => (
            <Link key={app.href} href={app.href} className="rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10">
              <h2 className="text-2xl font-bold">{app.title}</h2>
              <p className="text-gray-400 mt-2">{app.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
