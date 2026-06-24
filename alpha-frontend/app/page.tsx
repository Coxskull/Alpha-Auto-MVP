import Link from "next/link";

const apps = [
  {
    href: "/customer",
    title: "Customer App",
    description: "Shop auto parts and track deliveries",
    public: true,
    icon: "🛒",
    gradient: "from-emerald-500 to-green-700",
  },
  {
    href: "/login/admin",
    title: "Mission Control",
    description: "Dispatcher & operations dashboard",
    public: false,
    icon: "🖥️",
    gradient: "from-purple-500 to-indigo-700",
  },
  {
    href: "/login/driver",
    title: "Driver App",
    description: "Accept pickups and manage deliveries",
    public: false,
    icon: "🚚",
    gradient: "from-orange-500 to-red-600",
  },
  {
    href: "/login/provider",
    title: "Provider App",
    description: "Supplier inventory and fulfillment",
    public: false,
    icon: "🏭",
    gradient: "from-cyan-500 to-blue-700",
  },
  {
    href: "/login/mechanic",
    title: "Mechanic App",
    description: "On-site repairs and service requests",
    public: false,
    icon: "🔧",
    gradient: "from-yellow-500 to-amber-700",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#020617] text-white px-4 py-10">
      <div className="max-w-7xl mx-auto">

        {/* HERO */}
        <div className="text-center mb-14">
          <div className="inline-flex px-4 py-2 rounded-full bg-emerald-500 text-black font-bold text-sm">
            ALPHA AUTO PLATFORM
          </div>

          <h1 className="text-5xl md:text-7xl font-black mt-6">
            Alpha Platform
          </h1>

          <p className="text-gray-400 mt-5 max-w-3xl mx-auto text-lg">
            Unified automotive commerce, dispatch, logistics,
            delivery, supplier management, and mobile repair ecosystem.
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            ["Customers", "Live Orders"],
            ["Suppliers", "Parts Inventory"],
            ["Drivers", "Active Delivery"],
            ["Mechanics", "Service Requests"],
          ].map(([title, subtitle]) => (
            <div
              key={title}
              className="rounded-2xl bg-white/[0.03] border border-white/10 p-5"
            >
              <h3 className="font-bold text-lg">{title}</h3>
              <p className="text-gray-400 text-sm mt-1">
                {subtitle}
              </p>
            </div>
          ))}
        </div>

        {/* APP GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {apps.map((app) => (
            <Link
              key={app.href}
              href={app.href}
              className="
                group rounded-3xl border border-white/10
                bg-white/[0.03]
                hover:bg-white/[0.07]
                hover:scale-[1.02]
                transition-all duration-300
                p-6
              "
            >
              <div
                className={`
                  w-16 h-16 rounded-2xl
                  bg-gradient-to-br ${app.gradient}
                  flex items-center justify-center
                  text-3xl
                `}
              >
                {app.icon}
              </div>

              <div className="mt-5 flex justify-between items-start">
                <h2 className="text-2xl font-bold">
                  {app.title}
                </h2>

                <span
                  className={`text-xs px-3 py-1 rounded-full font-bold ${
                    app.public
                      ? "bg-green-500 text-black"
                      : "bg-orange-500 text-black"
                  }`}
                >
                  {app.public ? "PUBLIC" : "LOGIN"}
                </span>
              </div>

              <p className="text-gray-400 mt-4 leading-relaxed">
                {app.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}