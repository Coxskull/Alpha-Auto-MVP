import Link from "next/link";

const apps = [
  {
    href: "/customer",
    title: "Customer App",
    description: "Shop and track orders",
    public: true,
  },
  {
    href: "/login/admin",
    title: "Mission Control",
    description: "Dispatcher dashboard",
    public: false,
  },
  {
    href: "/login/driver",
    title: "Driver App",
    description: "Driver deliveries",
    public: false,
  },
  {
    href: "/login/provider",
    title: "Provider App",
    description: "Supplier/provider operations",
    public: false,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#020617] text-white px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {/* HERO */}
        <div className="text-center mb-12">
          <p className="text-green-400 font-bold uppercase tracking-[0.25em]">
            Alpha Auto
          </p>

          <h1 className="text-4xl md:text-6xl font-bold mt-4">
            Alpha Platform
          </h1>

          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            Real-time automotive parts ordering, dispatch,
            delivery, and supplier management platform.
          </p>
        </div>

        {/* APPS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {apps.map((app) => (
            <Link
              key={app.href}
              href={app.href}
              className="
                group rounded-3xl border border-white/10
                bg-white/[0.03]
                hover:bg-white/[0.08]
                transition-all duration-300
                p-6
              "
            >
              <div className="flex justify-between items-start">
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

              <p className="text-gray-400 mt-3">
                {app.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}