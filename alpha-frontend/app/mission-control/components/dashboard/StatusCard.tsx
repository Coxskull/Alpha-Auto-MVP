import {
  LucideIcon,
  TrendingUp,
} from "lucide-react";

type StatusCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  status?: "success" | "warning" | "danger";
};

export default function StatusCard({
  title,
  value,
  icon: Icon,
  change,
  status = "success",
}: StatusCardProps) {
  const statusColors = {
    success: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
  };

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/5 bg-[#111827] p-6 hover:border-green-500/20 hover:shadow-2xl hover:shadow-green-500/5 transition-all duration-300">
      {/* Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

      {/* Content */}
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">
              {title}
            </p>

            <h3 className="
text-2xl
sm:text-3xl
lg:text-4xl
font-bold
text-white
mt-4
">
              {value}
            </h3>

            {change && (
              <div className="flex items-center gap-2 mt-4">
                <TrendingUp
                  size={16}
                  className="text-green-400"
                />

                <span className="text-green-400 text-sm font-medium">
                  {change}
                </span>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />

            <div className="
relative
h-12
w-12
sm:h-14
sm:w-14 rounded-2xl bg-[#1F2937] border border-white/5 flex items-center justify-center">
              <Icon size={26} className="text-green-400" />
            </div>
          </div>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2 mt-8">
          <div
            className={`h-2.5 w-2.5 rounded-full ${statusColors[status]} animate-pulse`}
          />

          <span className="text-xs text-gray-500 uppercase tracking-widest">
            Live Operational Data
          </span>
        </div>
      </div>
    </div>
  );
}