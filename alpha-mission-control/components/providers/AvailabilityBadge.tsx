type Props = {
  status: string;
};

export default function AvailabilityBadge({
  status,
}: Props) {
  const styles = {
    available:
      "bg-green-500/20 text-green-400",

    busy:
      "bg-yellow-500/20 text-yellow-400",

    delivering:
      "bg-blue-500/20 text-blue-400",

    closed:
      "bg-red-500/20 text-red-400",

    emergency_only:
      "bg-orange-500/20 text-orange-400",

    offline:
      "bg-gray-500/20 text-gray-400",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        styles[
          status as keyof typeof styles
        ]
      }`}
    >
      {status}
    </span>
  );
}