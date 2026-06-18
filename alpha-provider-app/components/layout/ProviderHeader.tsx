export default function ProviderHeader() {
  return (
    <header className="h-16 bg-[#111827] border-b border-gray-800 flex items-center justify-between px-6">
      <h2 className="text-white text-lg font-semibold">
        Provider Dashboard
      </h2>

      <div className="flex items-center gap-4">
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="text-white">
          Online
        </span>
      </div>
    </header>
  );
}