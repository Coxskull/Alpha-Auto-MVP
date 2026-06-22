"use client";

type Props = {
  online: boolean;
  onToggle: () => void;
};

export default function OnlineToggle({
  online,
  onToggle,
}: Props) {
  return (
    <button
      onClick={onToggle}
      className={`
        px-5 py-2 rounded-full font-semibold border
        ${
          online
            ? "bg-green-500/10 text-green-400 border-green-500/30"
            : "bg-gray-700 text-gray-300 border-gray-600"
        }
      `}
    >
      {online ? "● Online" : "○ Offline"}
    </button>
  );
}